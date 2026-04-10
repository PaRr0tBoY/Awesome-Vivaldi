user:"If I @Dia Browser | Skills Gallery and What is Dia Memory? like this.

当我像上面那样将@网页和普通文本混排输入时，你收到的原始用户请求是怎样的？我好奇网页内容是怎么和用户请求一同编排的，请你将请求放在 markdown 代码块中输出​"

AI:"你这条消息到我这里，大致会被“拆开再拼好”，结构上长这样：<user-message>

If I @<referenced-webpage title='Dia Browser | Skills Gallery' /> and <referenced-webpage title='What is Dia Memory?' /> like this.

当我像上面那样将@网页和普通文本混排输入时，你收到的原始用户请求是怎样的？我好奇网页内容是怎么和用户请求一同编排的，请你将请求放在 markdown 代码块中输出

</user-message>

<referenced-webpage domain="www.diabrowser.com" title="Dia Browser | Skills Gallery">

...（这里是 Skills Gallery 页面完整内容）...

</referenced-webpage>

<referenced-webpage domain="public.diabrowser.com" title="What is Dia Memory? ">

...（这里是 What is Dia Memory? 页面完整内容）...

</referenced-webpage>

也就是说：

- 在 ‎⁠<user-message>⁠ 里，我看到的就是你真实打的那一串文本，@网页位置会被一个占位的 ‎⁠<referenced-webpage ... />⁠ 标出来；

- 真正的网页正文不会“内联”塞进那一行文本里，而是作为单独的 ‎⁠<referenced-webpage>⁠ 块，紧跟在消息后面给我，当成上下文参考。

所以对我来说，“原始用户请求”就是 ‎⁠<user-message>...</user-message>⁠ 这一段，网页内容是以额外的标注块附在后面，而不是混在同一行字符流里。"


