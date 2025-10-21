[Vivaldi GLM title modification script - Claude](https://claude.ai/chat/4fcbf111-9285-4989-8a67-d26e70469bc6)

# Function

---

 根据上述信息, 编写一个适用于Vivaldi的js模组, 需求如下:

1. 当标签页被固定, 获取标签页信息, 和提示词一起传给glm以利用AI修改标签页标题, 提示词在上文中已经提供了
2. 获取浏览器用户界面语言, 并传入提示词, 重命名标题应该取决于浏览器语言
3. 已经被修改过标题的标签页不再触发ai标题修改
4. 不允许以任何形式修改dom结构
5. .tab-position获取到.is-pinned类时触发AI重命名

# Bug

---

1. ==只修改现在固定的固定标签页标题, 避免修改非固定标签页标题==

# Feature

---

1. 将提示词翻译为中文
2. 添加一个AI加载动画
3. 添加流式输出动画, 但不能修改dom结构
4. 修改标题失败时添加失败通知

# Prefix

---

/*
* Site Security Box Favicons (a mod for Vivaldi)
* https://forum.vivaldi.net/topic/23813/site-security-box-favicons-mod
* Written by LonM, kichrot
* No Copyright Reserved
* This mod takes the favicon from a tab and places it into the address bar site info box
* Assumes presence of both the tab bar and the address bar
*/

# Test





适用于文档和提示词的模板