---
title: Area
order: 4
---

Area geometry mark class. <br />Often used to draw area charts.<br />

<a name="b821e2f0"></a>

## Inheritance

<br />↳ [Path](./path)<br />
<br />↳ **Area**<br />

<a name="d3474432"></a>

## Method for creation

```typescript
chart.area();
view.area();
```

<a name="3d0a2df9"></a>

### Parameters

<br />• **connectNulls**? : _boolean_<br />
<br />Whether connects null values or not<br />
<br />• **sortable**? : _boolean_<br />
<br />Whether sort the data<br />
<br />• **startOnZero**? : _boolean_<br />
<br />Whether the area chart is filled from the 0 baseline.<br />

1. The default value is `true`，as follows:<br />![startOnZero_default_true](https://gw.alipayobjects.com/zos/rmsportal/ZQqwUCczalrKqGgagOVp.png#align=left&display=inline&height=500&margin=%5Bobject%20Object%5D&originHeight=500&originWidth=800&status=done&style=none&width=800)
2. When the value is `false` the performance is as follows: <br />![startOnZero_default_false](https://gw.alipayobjects.com/zos/rmsportal/yPswkaXvUpCYOdhocGwB.png#align=left&display=inline&height=500&margin=%5Bobject%20Object%5D&originHeight=500&originWidth=800&status=done&style=none&width=800)

<br />• **theme**? : _object_<br />
<br />Theme configuration<br />
<br />• **visible**? : _boolean_<br />
<br />Whether is visible
