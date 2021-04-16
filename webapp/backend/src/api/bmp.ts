import {RouterContext} from '@koa/router';
import {Next} from 'koa';

import Database from '../db/getDatabase';
import Router = require('@koa/router');
const router = new Router();

router.get('/api/bmp/state', async (ctx: RouterContext, next: Next) => {});

function test() {
  console.log('closed');
}

router.get('/api/bmp/test', async (ctx: RouterContext, next: Next) => {
  ctx.req.on('close', test);
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 6000);
  });

  ctx.req.removeListener('close', test);
  ctx.body = 'ciao';
});

export default router;
