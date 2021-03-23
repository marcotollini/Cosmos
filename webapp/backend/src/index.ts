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
app.use(bmpRouter.routes());
app.use(vpnRouter.routes());

app.listen(3000);
