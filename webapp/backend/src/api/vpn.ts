import {RouterContext} from '@koa/router';
import {Next} from 'koa';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
const router = new Router();

router.get('/api/vpn/distinct', async (ctx: RouterContext, next: Next) => {
  const vpns = await Database?.getDistinctVpn();
  ctx.body = vpns;
  return;
});

export default router;
