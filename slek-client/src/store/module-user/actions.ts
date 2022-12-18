import { api } from 'src/boot/axios';
import ActivityService from 'src/services/ActivityService';
import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { UserStateInterface } from './state';
import { channelService } from 'src/services';

const actions: ActionTree<UserStateInterface, StateInterface> = {
  setError ({ commit }, message: string ) {
    commit('SET_ERROR', message)
  },
  clearErrorMessage({ commit }){
    commit('CLEAR_ERROR')
  },  
  async loadStatus({commit, rootState}){
    const payload = { user: rootState.auth.user?.username, data: 'dummyData' }

    const status = (await api.get('user/getStatus', { params: payload })).data[0].status
    
    commit('SET_STATUS', status)
  },
  async reportUser({commit, rootState}, username:string){
    const payload = { user: rootState.auth.user?.username, reported: username, channel: rootState.channels.activeChannel?.name }

    if(payload.channel && payload.user){
      let service = channelService.in(payload.channel)

      await service?.reportUser(payload.channel, payload.user, payload.reported)
    }
  },
  async kickUser({commit, rootState}, username:string){
    const payload = { user: rootState.auth.user?.username, reported: username, channel: rootState.channels.activeChannel?.name }

    if(payload.channel && payload.user){
      let service = channelService.in(payload.channel)

      await service?.kickUser(payload.channel, payload.user, payload.reported)
    }
  },

  async setOwnStatus({ commit }, status:string){
    commit("SET_STATUS", status)
  }
};

export default actions;
