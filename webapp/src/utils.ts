function routerToKey(obj: {bmp_router: string; rd: string}) {
  return `${obj.bmp_router}-${obj.rd}`;
}

export {routerToKey};
