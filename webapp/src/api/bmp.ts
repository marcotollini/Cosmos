import {RouterContext} from '@koa/router';
import {Next} from 'koa';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
const router = new Router();

router.get('/api/bmp/state', async (ctx: RouterContext, next: Next) => {
  const vpn = ctx.request.body.vpn;
  const timestamp = ctx.request.body.timestamp;
  if (!vpn || !timestamp) return ctx.throw(500);

  const state = await Database?.getBMPState(vpn, timestamp);
  ctx.body = state;
});

router.get('/api/bmp/upgrade', async (ctx: RouterContext, next: Next) => {
  const vpn = ctx.request.body.vpn;
  const timestamp = ctx.request.body.timestamp;
  const startTimestamp = ctx.request.body.startTtimestamp;
  if (!vpn || !timestamp || !startTimestamp) return ctx.throw(500);

  const upgrade = await Database?.getBMPUpgrade(vpn, timestamp, startTimestamp);
  ctx.body = upgrade;
});

export default router;
