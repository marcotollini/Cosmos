import {VirtualRouter} from 'cosmos-lib/src/types';

function virtualRouterToKey(virtualRouter: VirtualRouter) {
  return `${virtualRouter.bmp_router}-${virtualRouter.rd}`;
}

export {virtualRouterToKey};
