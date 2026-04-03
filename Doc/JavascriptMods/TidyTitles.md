[Vivaldi GLM title modification script - Claude](https://claude.ai/chat/4fcbf111-9285-4989-8a67-d26e70469bc6)

# Function

---

Based on the information above, create a JS module for Vivaldi with the following requirements:

1. When a tab is pinned, retrieve tab info and send it to GLM with a prompt to modify the tab title using AI. The prompt is provided above.
2. Get the browser's UI language and include it in the prompt. Title renaming should depend on the browser language.
3. Tabs that have already had their titles modified should not trigger another AI title modification.
4. Do not modify the DOM structure in any way.
5. Trigger AI renaming when `.tab-position` receives the `.is-pinned` class.

# Bug

---

1. ==Only modify the title of tabs that are currently pinned; avoid modifying titles of unpinned tabs.==

# Feature

---

1. Translate the prompt to Chinese. (Note: This is already completed as part of the English localization effort).
2. Add an AI loading animation.
3. Add a streaming output animation without modifying the DOM structure.
4. Add a notification when title modification fails.

# Prefix

---

/*
- Site Security Box Favicons (a mod for Vivaldi)
- https://forum.vivaldi.net/topic/23813/site-security-box-favicons-mod
- Written by LonM, kichrot
- No Copyright Reserved
- This mod takes the favicon from a tab and places it into the address bar site info box
- Assumes presence of both the tab bar and the address bar
*/

# Test

Template for documents and prompts.
