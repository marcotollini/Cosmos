import { createStore } from 'vuex'

export default createStore({
  state: {
    graph: 'ciao dallo stato'
  },
  mutations: {
    changeState(state) {
      state.graph = 'stato modificato'
    }
  },
  actions: {
  },
  modules: {
  }
})
