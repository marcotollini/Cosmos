import {RouterContext} from '@koa/router';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
import {isObject} from 'lodash';
const router = new Router();

router.post('/api/query/save', async (ctx: RouterContext) => {
  const reqBody = ctx.request.body;
  if (!isObject(reqBody.payload)) {
    ctx.throw('Missing payload', 500);
  }

  const payload = reqBody.payload as Record<string, unknown>;

  const query = Database.QuerySave(payload);
  const result = await query.execute();
  ctx.body = result;
});

router.get('/api/query/get/:id', async (ctx: RouterContext) => {
  const id = ctx.params.id;

  const query = Database.QueryGet(id);
  const result = await query.execute();
  if (result === undefined) {
    ctx.throw(404);
  }
  ctx.body = result;
});

export default router;
