import {Graphics} from 'pixi.js';
import {Attributes} from 'graphology-types';

interface Point {
  x: number;
  y: number;
}

const DEFAULT_GRAPHIC = {
  x: 0,
  y: 0,
  tint: 0xffffff,
  interactive: true,
  name: 'unknown',
};

const DEFAULT_NODE = {
  ...DEFAULT_GRAPHIC,
  zIndex: 100,
  width: 15,
  height: 15,
  interactive: true,
  name: 'unknown',
};

const DEFAULT_EDGE = {
  ...DEFAULT_GRAPHIC,
  zIndex: 50,
  width: 100,
  height: 6,
};

class Factory {
  static node() {
    const node = new Graphics();
    node.beginFill(0xffffff);
    node.drawCircle(0, 0, 20);
    node.endFill();
    return node;
  }

  static edge() {
    const edge = new Graphics();
    edge.beginFill(0xffffff);
    edge.drawRect(0, 0, 1, 1);
    edge.endFill();
    edge.pivot.set(0, 0.5);
    return edge;
  }

  static edgeRotation(n1: Point, n2: Point) {
    return Math.atan2(n2.y - n1.y, n2.x - n1.x);
  }

  static pythagoreanTheorem(n1: Point, n2: Point) {
    return Math.sqrt((n2.y - n1.y) ** 2 + (n2.x - n1.x) ** 2);
  }

  static updateGraphic(node: Graphics, options: Attributes) {
    for (const attr in options) {
      const attrSplit = attr.split('-');

      if (attrSplit.length > 2)
        throw `Attribute wrong: ${attr}. Should have only one -`;

      if (attrSplit.length === 1 && attr in node) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: No overload matches this call
        node[attr] = options[attr];
      } else if (
        attrSplit.length === 2 &&
        attrSplit[0] in node &&
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: No overload matches this call
        attrSplit[1] in node[attrSplit[0]]
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: No overload matches this call
        node[attrSplit[0]][attrSplit[1]] = options[attr];
      }
    }
  }
}
export default Factory;

export {Point, DEFAULT_NODE, DEFAULT_EDGE};
