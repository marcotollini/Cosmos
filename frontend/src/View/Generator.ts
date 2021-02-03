import {Graphics} from './pixi';
import {defaults} from 'underscore';

interface NodeProperties {
  color?: number;
  circlex?: number;
  circley?: number;
  radius?: number;
  x?: number;
  y?: number;
  [propName: string]: any;
}

interface EdgeProperties {
  color?: number;
  width?: number;
  alpha?: number;
  alignment?: number;
  native?: boolean;
  fromx?: number;
  fromy?: number;
  tox?: number;
  toy?: number;
  [propName: string]: any;
}

class Generator {
  constructor() {}

  getNodeProperties(properties: NodeProperties) {
    const defaultValues = {
      color: 0xffffff,
      circlex: 0,
      circley: 0,
      radius: 20,
      x: 0,
      y: 0,
      zindex: 100,
    };

    return defaults(properties, defaultValues);
  }

  getEdgeProperties(properties: EdgeProperties) {
    const defaultValues = {
      color: 0xffffff,
      width: 1,
      alpha: 1,
      alignment: 0.5,
      native: false,
      fromx: 0,
      fromy: 0,
      tox: 20,
      toy: 20,
      zindex: 10,
    };

    return defaults(properties, defaultValues);
  }

  node(key: string, _prop: NodeProperties): Graphics {
    const properties = this.getNodeProperties(_prop);

    const circle = new Graphics();
    circle.beginFill(properties.color);
    circle.drawCircle(
      properties.circlex,
      properties.circley,
      properties.radius
    );

    circle.endFill();
    circle.x = properties.x;
    circle.y = properties.y;
    circle.name = key;
    circle.zIndex = properties.zindex;

    return circle;
  }

  edge(key: string, _prop: EdgeProperties): Graphics {
    const properties = this.getEdgeProperties(_prop);

    const line = new Graphics();
    line.lineStyle(
      properties.width,
      properties.color,
      properties.alpha,
      properties.alignment,
      properties.native
    );

    line.moveTo(properties.fromx, properties.fromy);
    line.lineTo(properties.tox, properties.toy);
    line.name = key;
    line.zIndex = properties.zindex;

    return line;
  }
}

export default Generator;
