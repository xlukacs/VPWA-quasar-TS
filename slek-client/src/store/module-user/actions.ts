import { api } from 'src/boot/axios';
import ActivityService from 'src/services/ActivityService';
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
  async loadStatus({commit, rootState}){
    // console.log(rootState.auth.user?.status)
    const payload = { user: rootState.auth.user?.username, data: 'dummyData' }

    const status = (await api.get('user/getStatus', { params: payload })).data[0].status

    commit('SET_STATUS', status)
  }
};

export default actions;
