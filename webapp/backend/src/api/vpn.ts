import {RouterContext} from '@koa/router';
import {Next} from 'koa';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
const router = new Router();

router.get('/api/vpn/distinct', async (ctx: RouterContext, next: Next) => {
  if (
    !ctx.request.query.timestamp ||
    typeof ctx.request.query.timestamp !== 'string'
  ) {
    return ctx.throw(500);
  }
  const timestamp = parseInt(ctx.request.query.timestamp);
  const vpns = await Database?.getDistinctVpn(timestamp);
  ctx.body = vpns;
  return;
});

export default router;
