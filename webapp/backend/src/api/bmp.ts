import {RouterContext} from '@koa/router';
import {Next} from 'koa';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
const router = new Router();

router.get('/api/bmp/state', async (ctx: RouterContext, next: Next) => {
  const reqQuery = ctx.request.query;
  if (
    !reqQuery.vpn ||
    typeof reqQuery.vpn !== 'string' ||
    !reqQuery.timestamp ||
    typeof reqQuery.timestamp !== 'string'
  ) {
    return ctx.throw(500);
  }

  const vpn = reqQuery.vpn;
  const timestamp = new Date(reqQuery.timestamp);

  const query = Database.BMPState(timestamp, vpn);

  ctx.req.on('close', query.cancel);

  const result = (await query.execute()) as Record<string, unknown>[];

  ctx.req.removeListener('close', query.cancel);
  ctx.body = result;
});

export default router;
