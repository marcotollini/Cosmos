import Koa = require('koa');
import bodyParser = require('koa-bodyparser');
import cors = require('@koa/cors');
import morgan = require('koa-morgan');

import Database from './db/getDatabase';

import bmpRouter from './api/bmp';
import vpnRouter from './api/vpn';

if (Database === undefined) {
  throw 'Database is missing';
}

const app = new Koa();

app.use(morgan('dev'));
app.use(bodyParser());
app.use(cors());

// Save idclient into the state, if present
// A client will always use this id for all the requests
// As long as the page is not reloaded
app.use(async (ctx, next) => {
  const reqQuery = ctx.request.query;
  if (reqQuery.idClient && typeof reqQuery.idClient === 'string') {
    ctx.state.idClient = reqQuery.idClient;
    delete reqQuery.idClient;
  }
  await next();
});

app.use(bmpRouter.routes());
app.use(vpnRouter.routes());

app.listen(3000);
