# React 动画性能优化关键举措

> 目标：实现 60fps（16.67ms/帧）的流畅动画，避免主线程阻塞

---

## 一、渲染管线与性能瓶颈

### 浏览器渲染流水线

```
JavaScript → Style → Layout → Paint → Composite
     ↑                            ↑
  主线程                      合成线程
(可被 JS 阻塞)              (独立运行)
```

**关键认知**：只有运行在**合成线程**上的属性动画才能真正实现 60fps。合成线程只处理 `transform` 和 `opacity`，其他属性动画必然经过主线程，存在掉帧风险。

### React 渲染对动画的影响

```
State Change → Re-render → Virtual DOM Diff → DOM Patch → Paint
     ↑                                    ↑
  主线程阻塞点                         重排/重绘触发点
```

React 的协调（Reconciliation）过程在主线程执行。当动画涉及的组件频繁重新渲染时，动画帧会被延迟。

---

## 二、关键举措（按优先级）

### 1. 仅使用 transform 和 opacity 做动画

**原理**：这两个属性在合成线程独立处理，不触发 Layout 和 Paint。

```css
/* ✅ 高性能 */
.element {
  transform: translateX(100px);  /* 合成线程 */
  opacity: 0.5;                  /* 合成线程 */
}

/* ❌ 触发 Layout（昂贵） */
.element {
  width: 200px;
  height: 100px;
  top: 50px;
  left: 20px;
  margin: 10px;
}

/* ❌ 触发 Paint（昂贵） */
.element {
  background-color: red;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**替代方案**：
- 位置变化 → `translate`
- 缩放 → `scale`
- 旋转 → `rotate`
- 显示/隐藏 → `opacity`（而非 `display: none`）

---

### 2. 使用 will-change 提示浏览器优化

**时机**：动画开始前声明，结束后移除。

```css
/* 动画开始前 */
.animating-element {
  will-change: transform, opacity;
}

/* 动画结束后（防止内存占用） */
.animating-element.done {
  will-change: auto;
}
```

**注意**：
- 避免在大量元素上同时使用 `will-change`，会导致内存压力
- 提前声明但延迟动画等同于浪费，应在动画即将触发时才启用

---

### 3. 避免 React 重新渲染打断动画

#### 3.1 使用 React.memo 包裹动画组件

```jsx
const AnimatedCard = React.memo(({ x, y, children }) => (
  <div style={{ transform: `translate(${x}px, ${y}px)` }}>
    {children}
  </div>
));
```

#### 3.2 使用 useMemo 缓存计算结果

```jsx
const transformStyle = useMemo(
  () => ({ transform: `translate(${x}px, ${y}px)` }),
  [x, y]
);
```

#### 3.3 分离动画状态与业务状态

```jsx
// 将动画状态放在组件外部或独立状态管理
const [animationX, setAnimationX] = useState(0); // 高频更新
const [data, setData] = useState(fetchedData);   // 低频更新

// 组件只接收最终的 transform 值
<div style={{ transform: `translate(${animationX}px, 0)` }} />
```

---

### 4. React 18 并发特性：useTransition / useDeferredValue

**适用场景**：动画触发时伴随大量状态更新。

```jsx
import { useTransition, useDeferredValue } from 'react';

function SearchableList({ query }) {
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  // 高优先级：用户输入 → 即时响应
  // 低优先级：列表过滤 → 不阻塞动画
  startTransition(() => {
    setSearchQuery(query);
  });

  return (
    <div style={{ opacity: isPending ? 0.7 : 1 }}>
      <List query={deferredQuery} />
    </div>
  );
}
```

---

### 5. CSS 动画优先于 JavaScript 动画

| 方案 | 主线程阻塞 | GPU 加速 | 复杂控制 | 首帧性能 |
|------|-----------|---------|---------|---------|
| CSS Animation | 部分阻塞 | 可用 | 弱 | 好 |
| CSS Transition | 部分阻塞 | 可用 | 弱 | 好 |
| requestAnimationFrame | 完全阻塞 | 需手动 | 强 | 差（首帧延迟）|
| Web Animations API | 部分阻塞 | 可用 | 中 | 好 |

**原则**：
- 简单状态切换动画（hover、toggle）→ CSS Transition
- 连续帧动画（进度条、loading）→ CSS Animation + `@keyframes`
- 需要物理引擎/手势 → JavaScript（但应降级到 CSS 动画）

---

### 6. 列表动画：虚拟化 + 增量渲染

**问题**：大量列表项同时动画会触发大量重渲染。

```jsx
import { FixedSizeList } from 'react-window';
import { motion } from 'framer-motion';

function VirtualizedAnimatedList({ items }) {
  return (
    <FixedSizeList height={400} itemCount={items.length} itemSize={50}>
      {({ index, style }) => (
        <motion.div
          style={style}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.02 }} // 交错动画
          key={items[index].id}
        >
          <ListItem data={items[index]} />
        </motion.div>
      )}
    </FixedSizeList>
  );
}
```

---

### 7. 动画库选型对比

| 库 | 渲染策略 | 首帧 | 包体积 | 适用场景 |
|----|---------|------|--------|---------|
| **Framer Motion** | 共享布局动画（layoutId） | 快 | ~40KB | 复杂 UI 动画、页面转场 |
| **React Spring** | 物理弹簧模拟 | 快 | ~15KB | 交互式动画、手势驱动 |
| **Motion One** | Web Animations API | 最快 | ~5KB | 轻量级、Performance First |
| **CSS Modules** | 直接输出 CSS | 最快 | 0KB | 简单动画（首选）|

**Framer Motion 特定优化**：

```jsx
// ✅ 使用 layoutId 实现跨组件共享动画
<motion.div layoutId="card-container">
  <Card key={activeId} />
</motion.div>

// ✅ 动画组件用 AnimatePresence 包裹，避免卸载时的闪动
<AnimatePresence mode="wait">
  <motion.div key={step} exit={{ opacity: 0 }} />
</AnimatePresence>

// ✅ 大量元素用 variants 批量处理
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.div variants={itemVariants} />
```

---

### 8. FLIP 技术：Layout 动画的替代方案

当动画目标不在同一组件树时，使用 FLIP（First-Last-Invert-Play）：

```jsx
import { motion, useMotionValue, useTransform } from 'framer-motion';

function DragToReorder() {
  const dragX = useMotionValue(0);

  // 首帧记录位置，拖拽时计算差值，应用 invert transform
  // 拖拽结束播放动画到新位置
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 200 }}
      style={{ x: dragX }}
    />
  );
}
```

---

## 三、实测检查清单

### Chrome DevTools Performance 面板

1. 录制动画操作
2. 查看 Main 线程：是否有超过 16ms 的任务（红色标记）
3. 查看 Compositor 线程：动画是否在独立线程运行
4. 帧率低于 50fps → 存在主线程阻塞

### React DevTools Profiler

1. 确认动画组件是否不必要的重新渲染
2. 高亮更新：动画期间是否有无关组件被更新

### 关键指标阈值

| 指标 | 目标值 | 警告值 |
|------|--------|--------|
| 帧率 | 60fps | < 50fps |
| 单帧耗时 | < 16.67ms | > 33ms |
| 动画任务主线程耗时 | < 4ms | > 8ms |
| 动画期间 Layout 重算 | 0次 | > 0次 |

---

## 四、常见反模式

| 反模式 | 后果 | 修正方案 |
|--------|------|---------|
| 动画属性放在 state 中 | 每次 state 变化触发完整 re-render | 用 ref 或外部状态 |
| 数组 map 中直接创建 motion 组件 | 列表变化导致全部重新创建 | 用 useMemo 或虚拟列表 |
| 同时动画 width + height | 触发 Layout | 用 scale 代替 |
| 在动画中调用 setState | 动画被 React 渲染循环阻塞 | 分离状态或用 CSS |
| 大量 will-change 声明 | 内存压力，掉帧 | 按需开启 |
| 在 `onMouseMove` 中直接更新 state | 每帧触发 re-render | 用 requestAnimationFrame + ref |

---

## 五、总结

**核心原则**（按执行优先级）：

1. **只动画 transform + opacity**（合成线程）
2. **will-change 提前声明，动画结束清除**
3. **React.memo + useMemo 阻止不必要的 re-render**
4. **CSS 动画优先，JS 动画仅用于手势/物理模拟**
5. **useTransition / useDeferredValue 分离优先级**
6. **列表虚拟化 + 交错动画**
7. **选型：CSS Modules → Motion One → React Spring → Framer Motion**

遵循以上举措，可确保动画在 60fps 下稳定运行，主线程不被阻塞。
