import {AxiosInstance} from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $http: AxiosInstance;
  }
}
