import Koa = require('koa');
import morgan = require('koa-morgan');
import SocketIO = require('socket.io');
import {createServer} from 'http';

const app = new Koa();

app.use(morgan('dev'));

const socketOptions = {
  path: '/socket/',
  cors: {
    origin: 'http://localhost:8080',
  },
};
const httpServer = createServer(app.callback());
const io = new SocketIO.Server(httpServer, socketOptions);
httpServer.listen(3000);

interface socketData {
  selectedTimestamp: Date | undefined;
  selectedVPN: string | undefined;
}

const prefixSync = 'SYNC_';
io.on('connection', (socket: SocketIO.Socket) => {
  socket.data = {
    selectedTimestamp: undefined,
    selectedVPN: undefined,
  } as socketData;

  socket.on(`${prefixSync}selectedTimestamp`, selectedTimestamp => {
    console.log(selectedTimestamp);
    if (selectedTimestamp === undefined || selectedTimestamp === null)
      socket.data.selectedTimestamp = undefined;
    else socket.data.selectedTimestamp = new Date(selectedTimestamp);
    console.log(socket.data);
  });

  socket.on(`${prefixSync}selectedVPN`, selectedVPN => {
    socket.data.selectedVPN = selectedVPN;
    console.log(socket.data);
  });
});
