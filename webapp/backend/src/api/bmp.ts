import {RouterContext} from '@koa/router';
import {Next} from 'koa';
import {isString, partialRight} from 'lodash';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
const router = new Router();

async function bmp_process(ctx: RouterContext, constructor: Function) {
  const reqQuery = ctx.request.query;
  if (!isString(reqQuery.vpn) || !isString(reqQuery.timestamp)) {
    ctx.throw(500);
  }

  const vpn = reqQuery.vpn;
  const timestamp = new Date(reqQuery.timestamp);

  const query = constructor(timestamp, vpn);

  ctx.req.on('close', query.cancel.bind(query));

  const result = await query.execute();

  ctx.req.removeListener('close', query.cancel);

  return result;
}

router.get('/api/bmp/state', async (ctx: RouterContext) => {
  ctx.body = await bmp_process(ctx, Database.BMPState);
});

router.get('/api/bmp/filter/fields/list', async (ctx: RouterContext) => {
  ctx.body = await bmp_process(ctx, Database.FilterFieldsList);
});

router.get('/api/bmp/filter/fields/values', async (ctx: RouterContext) => {
  ctx.body = await bmp_process(ctx, Database.FilterFieldsValues);
});

router.get(
  '/api/bmp/filter/field/values/:fieldName',
  async (ctx: RouterContext) => {
    const fn = partialRight(Database.FilterFieldValues, ctx.params.fieldName);
    ctx.body = await bmp_process(ctx, fn);
  }
);

router.get(
  '/api/bmp/visualization/vpn/topology',
  async (ctx: RouterContext) => {
    ctx.body = await bmp_process(ctx, Database.VisualizationVPNTopology);
  }
);

export default router;
