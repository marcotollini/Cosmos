import {VirtualRouter} from './db/types';

function virtualRouterToKey(virtualRouter: VirtualRouter) {
  return `${virtualRouter.bmp_router}-${virtualRouter.rd}`;
}

export {virtualRouterToKey};
