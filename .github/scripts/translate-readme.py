"""
README full-translation powered by OpenRouter API.

Strategy:
  1. Extract ALL paths/URLs from English README → replace with [PATH_NNN] tokens
  2. Send tokenized text + repo file tree to AI for translation
  3. Restore tokens → output is guaranteed path-safe (AI can't corrupt what isn't there)

Usage:
  python3 translate-readme.py <english_file> <output_file> [mode: main|80]

Env vars: OPENROUTER_KEY, OPENROUTER_MODEL (optional)
"""
import json, os, re, subprocess, sys


# ============================================================
# Path tokenization
# ============================================================
# Match markdown links [text](url), images ![alt](url), bare URLs, and relative paths
PATH_RE = re.compile(
    r'(!?\[[^\]]*\]\([^)]+\))'         # [text](url) or ![alt](url)
    r'|(https?://[^\s<>"\')\]]+)'       # bare http(s) URLs
    r'|(src="[^"]+")'                   # src="..."
    r'|(\.\.?/[^\s<>"\')\]]+)'          # relative paths like ./foo/bar
)

# Paths we never tokenize (these are placeholders in the README template)
PRESERVE_PREFIXES = [
    # Keep markdown anchor links like (#section) — they're not paths
]


def tokenize(text):
    """Replace all paths/URLs with [PATH_NNN] tokens. Returns (tokenized_text, token_map)."""
    token_map = {}  # token → original
    counter = [0]

    def replacer(m):
        original = m.group(0)
        token = f'[PATH_{counter[0]:03d}]'
        token_map[token] = original
        counter[0] += 1
        return token

    # Find and replace in order (important: replace from left to right)
    result = PATH_RE.sub(replacer, text)

    return result, token_map


def detokenize(text, token_map):
    """Replace [PATH_NNN] tokens back to original paths."""
    result = text
    for token, original in token_map.items():
        result = result.replace(token, original)
    return result


# ============================================================
# Repo structure (file tree)
# ============================================================
def get_repo_structure():
    """Generate a simplified file tree of the repo for AI context."""
    important_dirs = [
        '.', 'Doc', 'Doc/READMEZH', 'Doc/mod', 'Doc/modzh', 'Doc/dev',
        'Others', 'Others/assets', 'Vivaldi8.0Stable',
        'Vivaldi8.0Stable/CSS', 'Vivaldi8.0Stable/Javascripts',
    ]
    lines = []
    for d in important_dirs:
        if os.path.isdir(d):
            files = sorted(os.listdir(d))[:30]  # cap per dir
            lines.append(f'{d}/')
            for f in files:
                lines.append(f'  {f}')
            if len(os.listdir(d)) > 30:
                lines.append(f'  ... ({len(os.listdir(d))} files total)')
    return '\n'.join(lines)


# ============================================================
# Main
# ============================================================
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 translate-readme.py <english_file> <output_file> [mode]", file=sys.stderr)
        sys.exit(1)

    english_file = sys.argv[1]
    output_file = sys.argv[2]
    mode = sys.argv[3] if len(sys.argv) > 3 else 'main'

    if not os.path.exists(english_file):
        print(f"::error::English file not found: {english_file}", file=sys.stderr)
        sys.exit(1)

    with open(english_file, 'r', encoding='utf-8') as f:
        english_text = f.read()

    if not english_text.strip():
        print("::error::English README is empty", file=sys.stderr)
        sys.exit(1)

    # Step 1: Tokenize paths → AI can't corrupt them
    tokenized_text, token_map = tokenize(english_text)
    print(f"Tokenized {len(token_map)} paths/URLs", file=sys.stderr)

    # Step 2: Get repo structure for context
    repo_tree = get_repo_structure()

    # Step 3: Build header navigation label
    if mode == '80':
        header_nav = '[English](../../Vivaldi8.0Stable/README.md) | **简体中文**'
    else:
        header_nav = '[English](../../README.md) | **简体中文**'

    # Step 4: Build prompt
    prompt = f"""You are translating a README for the Awesome Vivaldi browser mod project from English to Simplified Chinese.

## Translation Rules

1. Translate ALL English prose to natural Simplified Chinese (简体中文)
2. [PATH_NNN] tokens are PATH PLACEHOLDERS — keep them EXACTLY as-is, DO NOT modify, reorder, translate, or delete them
3. Keep ALL markdown structure intact (headings, lists, tables, code blocks, badges, HTML tags)
4. DO NOT translate: "Vivaldi", "Vivaldi8.0Stable", "Awesome Vivaldi", file names (like "VividPeek.js"), variable names, bash commands, code
5. Keep the header navigation as: {header_nav}
6. Table alignment markers (| :--- | :--- |) must be preserved exactly
7. Output ONLY the translated markdown — no commentary, no code fences, no explanations
8. The project is at https://github.com/PaRr0tBoY/Awesome-Vivaldi

## Repository Structure (for context)

This is the file layout of the project. Use this to understand what paths are valid:

```
{repo_tree}
```

## English README to Translate

```
{tokenized_text}
```
"""

    # Step 5: Call OpenRouter API
    api_key = os.environ.get('OPENROUTER_KEY', '')
    if not api_key:
        print("::error::OPENROUTER_KEY is not set", file=sys.stderr)
        sys.exit(1)

    model = os.environ.get('OPENROUTER_MODEL', '').strip() or 'openrouter/free'

    print(f"Using model: {model}", file=sys.stderr)
    print(f"Prompt size: {len(prompt)} chars", file=sys.stderr)

    import time
    start = time.time()

    # Configure payload based on model
    payload_data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}]
    }

    # For reasoning models, set max_tokens
    if any(m in model.lower() for m in ['deepseek-r1', 'o1', 'o3', 'claude']):
        payload_data["max_tokens"] = 16000

    payload = json.dumps(payload_data)

    # Retry loop for transient API failures (free tier rate limits, etc.)
    MAX_RETRIES = 3
    RETRY_DELAY = 3  # seconds

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = subprocess.run(
                ["curl", "-s", "-w", "\n%{http_code}",
                 "https://openrouter.ai/api/v1/chat/completions",
                 "-H", f"Authorization: Bearer {api_key}",
                 "-H", "Content-Type: application/json",
                 "-d", payload],
                capture_output=True, text=True, timeout=180
            )
        except subprocess.TimeoutExpired:
            print(f"::warning::API request timed out (attempt {attempt}/{MAX_RETRIES})", file=sys.stderr)
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
                continue
            print("::error::API request timed out after all retries", file=sys.stderr)
            sys.exit(1)

        elapsed = time.time() - start
        print(f"API response in {elapsed:.1f}s (attempt {attempt}/{MAX_RETRIES})", file=sys.stderr)

        stdout = resp.stdout
        lines = stdout.strip().split('\n')
        http_code = lines[-1].strip()
        body = '\n'.join(lines[:-1])

        if http_code != "200":
            print(f"::warning::API returned HTTP {http_code} (attempt {attempt}/{MAX_RETRIES})", file=sys.stderr)
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
                continue
            print(f"::error::API returned HTTP {http_code}: {body[:300]}", file=sys.stderr)
            sys.exit(1)

        # Parse response
        try:
            data = json.loads(body)
            translated = data.get('choices', [{}])[0].get('message', {}).get('content', '')
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            print(f"::warning::Failed to parse API response (attempt {attempt}/{MAX_RETRIES}): {e}", file=sys.stderr)
            print(f"::debug::Body: {body[:200]}", file=sys.stderr)
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
                continue
            print(f"::error::Failed to parse API response after all retries: {e}", file=sys.stderr)
            sys.exit(1)

        if translated and translated != 'null':
            break  # Success!

        print(f"::warning::Translation returned empty content (attempt {attempt}/{MAX_RETRIES})", file=sys.stderr)
        finish = data.get('choices', [{}])[0].get('finish_reason', 'unknown')
        print(f"::warning::Finish reason: {finish}", file=sys.stderr)
        if attempt < MAX_RETRIES:
            time.sleep(RETRY_DELAY)
            continue
        print("::error::Translation returned empty content after all retries", file=sys.stderr)
        sys.exit(1)

    # Step 6: Detokenize — restore original paths
    translated = detokenize(translated, token_map)

    # Step 7: Verify all tokens were restored
    missing = re.findall(r'\[PATH_\d{3}\]', translated)
    if missing:
        print(f"::warning::{len(missing)} unreplaced tokens remain: {missing[:5]}", file=sys.stderr)
        # Try to recover: these tokens might have been mangled by the AI
        # Remove any remaining tokens so they don't appear in output
        for token in set(missing):
            if token in token_map:
                translated = translated.replace(token, token_map[token])

    # Final check
    final_missing = re.findall(r'\[PATH_\d{3}\]', translated)
    if final_missing:
        print(f"::error::{len(final_missing)} unrecoverable tokens", file=sys.stderr)
        sys.exit(1)

    # Prepend source-commit marker for staleness detection
    source_commit = os.environ.get('SOURCE_COMMIT', '').strip()
    if source_commit:
        translated = f'<!-- source-commit: {source_commit} -->\n{translated}'

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(translated)

    print(f"Translation complete ({len(translated)} chars)", file=sys.stderr)


if __name__ == '__main__':
    main()
