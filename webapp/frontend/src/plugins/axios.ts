import {App} from 'vue';
import axios, {CancelTokenSource} from 'axios';
import {findKey, uniq, uniqueId} from 'lodash';

async function sleep(timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

function generateClientId() {
  return Array.from(Array(32), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('');
}

const idClient = generateClientId();

export default {
  install: (app: App) => {
    const instance = axios.create({
      baseURL: 'http://10.212.226.67:3000',
    });

    const tokenStore = {} as Record<string, CancelTokenSource>;
    const executionStore = {} as Record<
      string,
      {
        last: number;
        next: string | undefined;
      }
    >;

    instance.interceptors.request.use(
      async config => {
        if (config.method === 'get' || config.method === 'GET') {
          if (config.params === undefined) config.params = {};
          config.params.idClient = idClient;
        } else {
          if (config.data === undefined) config.data = {};
          config.data.idClient = idClient;
        }

        if (config.headers && config.headers['REQUEST_ID']) {
          const idRequest = config.headers['REQUEST_ID'];
          delete config.headers['REQUEST_ID'];

          if (config.headers['THROTTLE'] !== undefined) {
            const throttleTime = parseInt(config.headers['THROTTLE']);
            delete config.headers['THROTTLE'];

            if (executionStore[idRequest]) {
              const uid = uniqueId();
              executionStore[idRequest].next = uid;
              const currentTime = new Date().getTime();
              const sleepTime =
                executionStore[idRequest].last + throttleTime - currentTime;

              if (sleepTime > 0) await sleep(sleepTime);

              if (executionStore[idRequest].next !== uid) {
                const error = new Error('Request aborted');
                error.name = 'REQABORTTHROTTLE';
                throw error;
              }
              executionStore[idRequest].next = undefined;
            }

            executionStore[idRequest] = {
              last: new Date().getTime(),
              next: undefined,
            };
          }

          if (config.headers['CANCEL'] === 'true') {
            delete config.headers['CANCEL'];
            if (tokenStore[idRequest]) {
              tokenStore[idRequest].cancel();
            }

            const axiosToken = axios.CancelToken.source();
            tokenStore[idRequest] = axiosToken;
            config.cancelToken = axiosToken.token;
          }
        }
        return config;
      },
      error => {
        console.error('Error in axios library by Cosmos', error);
      }
    );

    instance.interceptors.response.use(response => {
      if (response.config.cancelToken) {
        const idRequest = findKey(tokenStore, o => {
          return o.token === response.config.cancelToken;
        });
        if (idRequest !== undefined) {
          delete tokenStore[idRequest];
        }
      }

      return response;
    });

    app.config.globalProperties.$http = instance;
    app.provide('http', instance);
  },
};
