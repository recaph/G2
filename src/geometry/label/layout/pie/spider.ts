import { Coordinate } from '@antv/coord';
import { BBox, IGroup, IShape, IElement } from '@antv/g-base';
import { each, find, get, isObject } from '@antv/util';
import { LabelItem } from '../../interface';
import { antiCollision } from './outer';

/** 拐点偏移量, 通过 offset 可配置 */
const INFLECTION_OFFSET = 15;

/**
 * 饼图标签 spider 布局, 只适用于 pie-spider 的标签类型
 * region 应该是 labelsRenderer 容器的范围限制(便于后续组件间布局)
 */
export function pieSpiderLabelLayout(items: LabelItem[], labels: IGroup[], shapes: IShape[] | IGroup[], region: BBox) {
  const labelType = get(
    find(items, (item) => item.type),
    'type'
  );
  if (labelType !== 'pie-spider') {
    return;
  }

  const coordinate: Coordinate = labels[0].get('coordinate');
  const radius = coordinate.getRadius();
  const center = coordinate.getCenter();

  // step 1: separate labels
  const halves: LabelItem[][] = [[] /** left */, [] /** right */];
  items.forEach((labelItem) => {
    if (!labelItem) {
      return;
    }
    if (labelItem.x < center.x) {
      // left
      halves[0].push(labelItem);
    } else {
      // right or center will be put on the right side
      halves[1].push(labelItem);
    }
  });

  // note: labelHeight 可以控制 label 的行高
  const labelHeight: number = get(items[0], 'labelHeight', 14);
  const labelOffset: number = get(items[0], 'offset', INFLECTION_OFFSET);

  /** labels 容器的范围(后续根据组件的布局设计 进行调整) */
  const labelsContainerRange = {
    minX: coordinate.start.x,
    minY: Math.max(coordinate.end.y, center.y - radius - (labelOffset + labelHeight)),
    maxX: coordinate.end.x,
    maxY: Math.min(coordinate.start.y, center.y + radius + (labelOffset + labelHeight)),
  };

  // step 2: antiCollision
  halves.forEach((half, isRight) => {
    antiCollision(half, labelHeight, labelsContainerRange, isRight);
  });

  // step 3: 布局后 调整 items
  const labelsMap = {};
  for (const labelShape of labels) {
    labelsMap[labelShape.get('id')] = labelShape;
  }

  const startY = labelsContainerRange.minY;
  const endY = labelsContainerRange.maxY;

  items.forEach((item) => {
    const labelShape = labelsMap[item.id];

    // @ts-ignore
    const { endPoint } = item;

    // out of range, hidden
    if (item.y < startY || item.y > endY) {
      labelShape.set('visible', false);
    } else {
      // adjust labelShape

      // because group could not effect text-shape, should set text-shape position manually
      const textShapes = labelShape.getChildren().filter((child) => child.get('type') !== 'path') as IElement;
      each(textShapes, (textShape) => {
        // 偏移距离
        textShape.translate(0, item.y - endPoint.y);
      });
    }
  });

  // step4: 调整 labelLines
  items.forEach((item) => {
    if (item && item.labelLine) {
      if (!isObject(item.labelLine)) {
        item.labelLine = {};
      }
      const isRight = item.x > center.x || (item.x === center.x && item.x > center.y);
      // @ts-ignore (key points had been stored，while generating spider-labels)
      const { startPoint, inflectionPoint, endPoint } = item;
      // 文本被调整下去了，则添加拐点连接线
      if (endPoint.y !== item.y) {
        const maxOffset = Math.abs(endPoint.x - inflectionPoint.x);
        const offsetX = Math.min(maxOffset / 4, 10 /** 待调节的参数 */);

        // 新拐点 1
        const p1 = {
          x: isRight
            ? Math.max(inflectionPoint.x, endPoint.x - offsetX * 3)
            : Math.min(inflectionPoint.x, endPoint.x + offsetX * 3),
          y: endPoint.y,
        };
        // 新拐点 2
        const p2 = {
          x: isRight ? Math.max(p1.x, endPoint.x - offsetX) : Math.min(p1.x, endPoint.x + offsetX),
          y: item.y,
        };
        const newEndPoint = {
          x: isRight ? p2.x + offsetX : p2.x - offsetX,
          y: item.y,
        };

        /** 是否在 第四象限 */
        if (item.angle < -Math.PI / 2) {
          inflectionPoint.y = Math.min(inflectionPoint.y, newEndPoint.y);
          p1.y = Math.min(p1.y, newEndPoint.y);
        }

        const path = [
          `M ${startPoint.x},${startPoint.y}`,
          `L ${inflectionPoint.x},${inflectionPoint.y}`,
          `L ${p1.x},${p1.y}`,
          `L ${p2.x},${p2.y}`,
          `L ${newEndPoint.x},${newEndPoint.y}`,
        ].join(' ');

        item.labelLine.path = path;
      }
    }
  });
}
