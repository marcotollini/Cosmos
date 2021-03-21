import {RouterContext} from '@koa/router';
import {Next} from 'koa';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
import {type} from 'node:os';
const router = new Router();

router.get('/api/bmp/state', async (ctx: RouterContext, next: Next) => {
  if (
    !ctx.request.query.vpn ||
    !ctx.request.query.timestamp ||
    typeof ctx.request.query.timestamp !== 'string' ||
    typeof ctx.request.query.vpn !== 'string'
  )
    return ctx.throw(400);
  const vpn = ctx.request.query.vpn;
  const timestamp = parseInt(ctx.request.query.timestamp);

  const state = await Database?.getBMPState(vpn, timestamp);
  ctx.body = state;
  return;
});

router.get('/api/bmp/upgrade', async (ctx: RouterContext, next: Next) => {
  const vpn = ctx.request.body.vpn;
  const timestamp = ctx.request.body.timestamp;
  const startTimestamp = ctx.request.body.startTtimestamp;
  if (!vpn || !timestamp || !startTimestamp) return ctx.throw(500);

  const upgrade = await Database?.getBMPUpgrade(vpn, timestamp, startTimestamp);
  ctx.body = upgrade;
  return;
});

export default router;
