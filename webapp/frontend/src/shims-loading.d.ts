// https://stackoverflow.com/questions/64412243/vue-js-3-and-typescript-property-store-does-not-exist-on-type-componentpub
import {ElLoading} from 'element-plus';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $loading: ElLoading;
  }
}
