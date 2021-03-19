import Koa = require('koa');
import bodyParser = require('koa-bodyparser');
import morgan = require('koa-morgan');
import {RouterContext} from '@koa/router';
import {Next} from 'koa';
import Database from './db/getDatabase';
import {calcBmpRouterState} from './state/router';

if (Database === undefined) {
  throw 'Database is missing';
}

const app = new Koa();

app.use(morgan('dev'));
app.use(bodyParser());

app.use(async (ctx: RouterContext, next: Next) => {
  console.log('Body parsed', ctx.request.body);
  const states = await Database?.stateVpn(15, '100');
  if (states === undefined) return;

  const [stateDump, stateEvent] = states;
  const graph = calcBmpRouterState(stateDump);
  console.log(graph['192.168.0.1-10']);
  console.log(stateEvent);

  await next();
});

app.listen(3000);
