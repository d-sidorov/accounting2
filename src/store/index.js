import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import products from './modules/products/'
import operations from './modules/operations/'
import deals from './modules/deals/'
import settings from './modules/settings'


export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      operations,
      products,
      deals,
      settings
    },

    strict: false
  })

  return Store
}
