import {App} from 'vue';
import axios, {CancelTokenSource} from 'axios';
import {findKey, uniq, uniqueId} from 'lodash';

async function sleep(timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

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
        if (config.headers && config.headers['REQUEST_ID']) {
          const idRequest = config.headers['REQUEST_ID'];
          delete config.headers['REQUEST_ID'];

          if (config.headers['CANCEL'] === 'true') {
            if (tokenStore[idRequest]) {
              tokenStore[idRequest].cancel();
            }

            const axiosToken = axios.CancelToken.source();
            tokenStore[idRequest] = axiosToken;
            config.cancelToken = axiosToken.token;
          }

          if (config.headers['THROTTLE'] !== undefined) {
            const throttleTime = parseInt(config.headers['THROTTLE']);

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
        }
        console.log(config.params);

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
