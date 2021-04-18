import {RouterContext} from '@koa/router';
import {Next} from 'koa';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
const router = new Router();

router.get('/api/vpn/list', async (ctx: RouterContext) => {
  const reqQuery = ctx.request.query;
  if (!reqQuery.timestamp || typeof reqQuery.timestamp !== 'string') {
    ctx.throw(500);
  }
  const timestamp = new Date(reqQuery.timestamp);
  const query = Database.VPNList(timestamp);

  ctx.req.on('close', query.cancel);

  const result = await query.execute();

  ctx.req.removeListener('close', query.cancel);
  ctx.body = result;
});

export default router;
