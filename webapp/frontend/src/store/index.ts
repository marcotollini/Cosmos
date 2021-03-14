import { createStore } from 'vuex'

export default createStore({
  state: {
    graph: []
  },
  mutations: {
    changeState(state: {graph: string[]}, graph: string[]) {
      state.graph = graph
    },
  },
  actions: {
    changeStateAsync({commit}){
      setTimeout(() => {
        const num = Math.floor(Math.random()*10)
        const nodes: string[] = []
        for(let i = 0; i < num; i++){
          nodes.push(Math.floor(Math.random()*500).toString())
        }
        commit('changeState', nodes)
      }, 1000)
    }
  },
  modules: {
  }
})
