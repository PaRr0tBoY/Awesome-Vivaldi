# CSS 学习练习

这个文件夹包含了帮助你学习 CSS 的练习项目。

## 文件说明

- **css-exercises.css**: 主要的练习文件，包含8个渐进式的CSS练习
- **index.html**: 用于测试CSS效果的HTML文件
- **answers.css**: 包含所有练习的答案（完成后查看）

## 练习内容

### 练习 1: CSS 变量和基础样式
学习如何定义和使用CSS变量，创建可维护的样式系统。

### 练习 2: 选择器和伪类
掌握CSS选择器的使用，包括类选择器、伪类和交互效果。

### 练习 3: Flexbox 布局
学习使用Flexbox创建灵活的布局，理解主轴和交叉轴概念。

### 练习 4: Grid 布局
掌握CSS Grid的使用，创建复杂的网格布局。

### 练习 5: 动画和过渡
学习如何创建平滑的动画效果和过渡。

### 练习 6: 响应式设计
掌握媒体查询的使用，创建适应不同设备的布局。

### 练习 7: CSS 函数和计算
学习使用calc()、min()、max()等CSS函数。

### 练习 8: 高级选择器
掌握高级CSS选择器的使用，包括后代、兄弟和属性选择器。

## 如何使用

1. 打开 `css-exercises.css` 文件
2. 找到 `TODO(human)` 标记的练习
3. 按照需求完成CSS代码
4. 在浏览器中打开 `index.html` 查看效果
5. 完成后可以查看 `answers.css` 中的答案

## 学习建议

- 按顺序完成练习，每个练习都建立在前一个的基础上
- 先理解需求，再编写代码
- 多尝试不同的属性值，观察效果变化
- 使用浏览器的开发者工具调试和检查样式

## CSS 基础知识回顾

### CSS 变量
```css
:root {
  --primary-color: #3498db;
  --spacing: 16px;
}
```

### 选择器
```css
.class-selector { }
#id-selector { }
element-selector { }
:hover { }
:focus { }
```

### 布局
```css
display: flex;
display: grid;
flex-direction: row;
grid-template-columns: 1fr 1fr 1fr;
```

### 响应式设计
```css
@media (max-width: 768px) {
  /* 移动端样式 */
}
```

### 动画
```css
transition: all 0.3s ease;
transform: translateX(10px);
```

祝你学习愉快！🎉