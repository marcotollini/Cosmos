import Koa = require('koa');
import bodyParser = require('koa-bodyparser');
import morgan = require('koa-morgan');

import Database from './db/getDatabase';
import bmpRouter from './api/bmp';

if (Database === undefined) {
  throw 'Database is missing';
}

const app = new Koa();

app.use(morgan('dev'));
app.use(bodyParser());
app.use(bmpRouter.routes());

app.listen(3000);
