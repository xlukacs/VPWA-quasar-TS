import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { UserStateInterface } from './state';

const actions: ActionTree<UserStateInterface, StateInterface> = {
  setError ({ commit }, message: string ) {
    commit('SET_ERROR', message)
  },
  clearErrorMessage({ commit }){
    commit('CLEAR_ERROR')
  },
  setStatus ({ commit }, status: string ) {
    commit('SET_STATUS', status)
    console.log(status)
  },
};

export default actions;
