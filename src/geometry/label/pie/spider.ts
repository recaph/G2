import { deepMix, each, isNil } from '@antv/util';
import { MappingDatum } from '../../../interface';
import { polarToCartesian } from '../../../util/graphics';
import { LabelCfg, LabelPointCfg, LabelItem } from '../interface';
import PieLabel from './index';

/** 拐点偏移量: offset */
const INFLECTION_OFFSET = 15;
/** 标签偏移量, distance between label and edge: offsetX */
const LABEL_OFFSET_X = 4;

/**
 * 饼图 spider label
 */
export default class PieSpiderLabel extends PieLabel {
  public defaultLayout = 'pie-spider';

  /**
   * @override
   * 获取 label 的位置
   * @param labelCfg
   * @param mappingData
   * @param index
   */
  protected getLabelPoint(labelCfg: LabelCfg, mappingData: MappingDatum, index: number): LabelPointCfg {
    const labelPositionCfg = super.getLabelPoint(labelCfg, mappingData, index);

    const coordinate = this.getCoordinate();
    const center = coordinate.getCenter();
    const radius = coordinate.getRadius();

    const inRight = labelPositionCfg.x > center.x || (labelPositionCfg.x === center.x && labelPositionCfg.y > center.y);
    const offset = !isNil(labelCfg.offset) ? labelCfg.offset : INFLECTION_OFFSET;
    const offsetX = !isNil(labelCfg.offsetX) ? labelCfg.offsetX : LABEL_OFFSET_X;
    const inflectionPoint = polarToCartesian(center.x, center.y, radius + offset, labelPositionCfg.angle);

    const totalOffset = offset + offsetX;

    labelPositionCfg.x = center.x + (inRight ? 1 : -1) * (radius + totalOffset);
    labelPositionCfg.y = inflectionPoint.y;

    const startPoint = polarToCartesian(center.x, center.y, radius, labelPositionCfg.angle);
    const endPoint = {
      x: !inRight
        ? Math.min(inflectionPoint.x, labelPositionCfg.x + offsetX)
        : Math.max(inflectionPoint.x, labelPositionCfg.x - offsetX),
      y: labelPositionCfg.y,
    };

    // store key points, will be used in drawLabelLine & doLabelLayout
    // @ts-ignore
    labelPositionCfg.startPoint = startPoint;
    // @ts-ignore
    labelPositionCfg.inflectionPoint = inflectionPoint;
    // @ts-ignore
    labelPositionCfg.endPoint = endPoint;

    // @ts-ignore clear offsetX, 不让 labelsRenderer 调整 label
    labelPositionCfg.offsetX = null;

    return labelPositionCfg;
  }

  public getLabelItems(mapppingArray: MappingDatum[]): LabelItem[] {
    const items = super.getLabelItems(mapppingArray);

    /** 定制 labelLine */
    each(items, (item) => {
      const { startPoint, inflectionPoint, endPoint } = item;

      item.labelLine = deepMix(
        {},
        item.labelLine,
        {
          path: [
            `M ${startPoint.x},${startPoint.y}`,
            `L ${inflectionPoint.x},${inflectionPoint.y}`,
            `L ${endPoint.x},${endPoint.y}`,
          ].join(' '),
        }
      );
    });

    return items;
  }
}
