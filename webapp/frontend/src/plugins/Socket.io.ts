import {io, SocketOptions, ManagerOptions} from 'socket.io-client';
import {App} from 'vue';

interface storeSettings {
  mutation: string;
  action: string;
  syncronize?: {
    elements: string[];
    prefix: string;
  };
}

interface SocketClientOptions {
  connection: string;
  options?: Partial<ManagerOptions & SocketOptions>;
  store?: storeSettings;
}

function storeSocket(
  this: Record<string, any>,
  store: storeSettings,
  eventName: string,
  ...args: any[]
) {
  const mutationName = `${store.mutation}${eventName}`;
  const actionName = `${store.action}${eventName}`;
  if (this.$store._mutations[mutationName] !== undefined) {
    this.$store.commit(mutationName, ...args);
  } else if (this.$store._actions[actionName] !== undefined) {
    this.$store.dispatch(actionName, ...args);
  } else {
    console.log(
      `No mutation nor action found for event "${eventName}". Add "${mutationName}" to the list of mutations, or "${actionName}" to the list of actions`
    );
  }
}

function storeSyncSocket(
  this: Record<string, any>,
  {syncronize}: storeSettings
) {
  if (!this.$store)
    return console.log('No state. Put app.use(state) before app.use(SocketIO)');

  if (syncronize === undefined) return;

  for (const element of syncronize.elements) {
    if (!Object.hasOwnProperty.call(this.$store._state.data, element)) {
      console.log(`"${element}" not found in the state`);
      continue;
    }

    this.$store.watch(
      (state: any) => state[element],
      (newValue: any, oldValue: any) => {
        this.$socket.emit(`${syncronize.prefix}${element}`, newValue);
      }
    );
  }
}

export default {
  install: (app: App, {connection, options, store}: SocketClientOptions) => {
    const socket = io(connection, options);
    app.config.globalProperties.$socket = socket;

    if (store !== undefined) {
      app.config.globalProperties.$storeSocket = storeSocket;

      socket.onAny((eventName: string, ...args: any[]) => {
        app.config.globalProperties.$storeSocket(store, eventName, ...args);
      });

      if (store.syncronize !== undefined) {
        app.config.globalProperties.$storeSyncSocket = storeSyncSocket;
        app.config.globalProperties.$storeSyncSocket(store);
      }
    }

    socket.on('connect', () => {
      console.log(
        'Socket connected with type',
        socket.io.engine.transport.name
      );

      setTimeout(() => {
        console.log(
          'Socket type after 5 seconds from connection:',
          socket.io.engine.transport.name
        );
      }, 5000);
    });

    app.provide('socket', socket);
  },
};

export {SocketClientOptions};
