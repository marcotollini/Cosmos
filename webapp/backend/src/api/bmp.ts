import {RouterContext} from '@koa/router';
import {Next} from 'koa';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
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
  if (
    !ctx.request.query.vpn ||
    !ctx.request.query.timestamp ||
    !ctx.request.query.startTimestamp ||
    typeof ctx.request.query.vpn !== 'string' ||
    typeof ctx.request.query.timestamp !== 'string' ||
    typeof ctx.request.query.startTimestamp !== 'string'
  )
    return ctx.throw(500);
  const vpn = ctx.request.query.vpn;
  const timestamp = parseInt(ctx.request.query.timestamp);
  const startTimestamp = parseInt(ctx.request.query.startTimestamp);

  const upgrade = await Database?.getBMPUpgrade(vpn, timestamp, startTimestamp);
  ctx.body = upgrade;
  return;
});

router.get('/api/bmp/count', async (ctx: RouterContext, next: Next) => {
  if (
    !ctx.request.query.startTimestamp ||
    !ctx.request.query.endTimestamp ||
    !ctx.request.query.precision ||
    typeof ctx.request.query.startTimestamp !== 'string' ||
    typeof ctx.request.query.endTimestamp !== 'string' ||
    typeof ctx.request.query.precision !== 'string' ||
    (ctx.request.query.approximation !== undefined &&
      ctx.request.query.approximation !== 'false' &&
      ctx.request.query.approximation !== 'true')
  )
    return ctx.throw(500);
  const start = parseInt(ctx.request.query.startTimestamp);
  const end = parseInt(ctx.request.query.endTimestamp);
  const precision = parseInt(ctx.request.query.precision);
  const approximation = ctx.request.query.approximation !== 'false';
  console.log(approximation);

  if (!approximation) {
    ctx.body = await Database?.getEventsCounter(start, end, precision);
    return;
  } else {
    ctx.body = await Database?.getEventsCounterApprox(start, end, precision);
    return;
  }
});

export default router;
