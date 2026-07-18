"""
README translator powered by OpenRouter API.
Usage:
  MODE=main   python3 translate-readme.py  # translate main README
  MODE=80     python3 translate-readme.py  # translate Vivaldi 8.0 README

Env vars: OPENROUTER_KEY, DIFF, ZH_CURRENT, MODE (main|80), OUTPUT_FILE
"""
import json, os, re, subprocess, sys

# ============================================================
# Path protection utilities
# ============================================================
PATH_PATTERN = re.compile(r'(?:\.\.?/[^\s<>"\'()\[\]]+|https?://[^\s<>"\'()\[\]]+)')

def protect_paths(text):
    """Replace all relative paths and URLs with __P0__, __P1__, ... placeholders.
    Returns (protected_text, [original_paths_list])."""
    paths = []
    def _repl(m):
        paths.append(m.group(0))
        return f'__P{len(paths)-1}__'
    protected = PATH_PATTERN.sub(_repl, text)
    return protected, paths

def restore_paths(text, paths):
    """Replace __P0__, __P1__, ... placeholders back with original paths."""
    result = text
    for i, original in enumerate(paths):
        result = result.replace(f'__P{i}__', original)
    return result

# ============================================================
# Load inputs
# ============================================================
diff_text = os.environ.get('DIFF', '')
zh_current = os.environ.get('ZH_CURRENT', '')
mode = os.environ.get('MODE', 'main')
output_file = os.environ.get('OUTPUT_FILE', '/tmp/translated_output.md')

# Protect paths in both the diff and existing translation
diff_protected, diff_paths = protect_paths(diff_text)
zh_protected, zh_paths = protect_paths(zh_current)

# Combined paths list for restoration later
all_paths = diff_paths + zh_paths

# ============================================================
# Build prompt
# ============================================================
if mode == '80':
    header_nav = '[English](../../Vivaldi8.0Stable/README.md) | **简体中文**'
else:
    header_nav = '[English](../../README.md) | **简体中文**'

prompt = f"""You are a README translator for a Vivaldi browser mod project.

TASK: Apply the English diff to the existing Chinese translation. Only translate and update the changed parts based on the diff. Keep everything else completely identical.

CRITICAL RULES:
1. NEVER modify any file path, URL, or relative path — these are IDENTIFIERS, not text to translate
2. NEVER modify image sources (src="..."), links ([...](...)), or HTML attributes
3. NEVER modify code blocks, backtick-quoted text, bash commands, or file names
4. NEVER translate "Vivaldi8.0Stable", "Vivaldi", variable names, or mod file names like "VividPeek.js"
5. Keep all markdown structure, HTML tags, badges, anchor links (#xxx), and relative paths EXACTLY as-is
6. The header navigation must stay: {header_nav}
7. Output the COMPLETE updated Chinese README (not just the diff)
8. No commentary, no code fences, just raw markdown
9. If a markdown table has alignment markers (| :--- | :--- |), preserve them exactly

ENGLISH DIFF (what changed):
```
{diff_protected}
```
"""

if zh_protected:
    prompt += f"""
EXISTING CHINESE README:
```
{zh_protected}
```"""
else:
    prompt += """
EXISTING CHINESE README: (empty — translate the full diff as a new file)"""

prompt += """

IMPORTANT: Compare the diff against the existing Chinese file. Only modify sections that correspond to the changed lines in the diff. Copy everything else verbatim."""

# ============================================================
# Call OpenRouter API
# ============================================================
api_key = os.environ.get('OPENROUTER_KEY', '')
if not api_key:
    print("::error::OPENROUTER_KEY is not set", file=sys.stderr)
    sys.exit(1)

payload = json.dumps({
    "model": "openrouter/quasar-alpha",
    "messages": [{"role": "user", "content": prompt}]
})

try:
    resp = subprocess.run(
        ["curl", "-s", "-w", "\n%{http_code}",
         "https://openrouter.ai/api/v1/chat/completions",
         "-H", f"Authorization: Bearer {api_key}",
         "-H", "Content-Type: application/json",
         "-d", payload],
        capture_output=True, text=True, timeout=120
    )
except subprocess.TimeoutExpired:
    print("::error::API request timed out after 120s", file=sys.stderr)
    sys.exit(1)

stdout = resp.stdout
# Separate body and status code (last line)
lines = stdout.strip().split('\n')
http_code = lines[-1].strip()
body = '\n'.join(lines[:-1])

if http_code != "200":
    print(f"::error::API returned HTTP {http_code}: {body}", file=sys.stderr)
    sys.exit(1)

# Parse response
try:
    data = json.loads(body)
    translated = data.get('choices', [{}])[0].get('message', {}).get('content', '')
except (json.JSONDecodeError, KeyError, IndexError) as e:
    print(f"::error::Failed to parse API response: {e}", file=sys.stderr)
    print(body, file=sys.stderr)
    sys.exit(1)

if not translated or translated == 'null':
    print("::error::Translation returned empty content", file=sys.stderr)
    print(body, file=sys.stderr)
    sys.exit(1)

# ============================================================
# Restore paths
# ============================================================
translated = restore_paths(translated, all_paths)

# Verify: if any __P remains, something went wrong
remaining = re.findall(r'__P\d+__', translated)
if remaining:
    print(f"::warning::Found {len(remaining)} unreplaced path placeholders in translated output", file=sys.stderr)

# Write output file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(translated)

print(f"Translation ({mode}) completed successfully", file=sys.stderr)
