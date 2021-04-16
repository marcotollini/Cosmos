import {RouterContext} from '@koa/router';
import {Next} from 'koa';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
const router = new Router();

router.get('/api/vpn/list', async (ctx: RouterContext, next: Next) => {
  const reqQuery = ctx.request.query;
  if (!reqQuery.timestamp || typeof reqQuery.timestamp !== 'string') {
    return ctx.throw(500);
  }
  const timestamp = new Date(reqQuery.timestamp);
  const query = Database.VPNList(timestamp);

  const result = (await query.execute()) as string[];

  ctx.body = result;
});

export default router;
