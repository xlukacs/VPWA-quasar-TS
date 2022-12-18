import { api } from 'src/boot/axios';
import ActivityService from 'src/services/ActivityService';
import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { UserStateInterface } from './state';
import { User } from 'src/contracts';
import { channelService } from 'src/services';

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
  },
  async reportUser({commit, rootState}, username:string){
    const payload = { user: rootState.auth.user?.username, reported: username, channel: rootState.channels.activeChannel?.name }
    //console.log(payload)

    //await api.get('user/reportUser', { params: payload })
    if(payload.channel && payload.user){
      let service = channelService.in(payload.channel)

      //console.log(service)
      await service?.reportUser(payload.channel, payload.user, payload.reported)
    }
  },
  async kickUser({commit, rootState}, username:string){
    const payload = { user: rootState.auth.user?.username, reported: username, channel: rootState.channels.activeChannel?.name }

    // await api.get('user/kickUser', { params: payload })
    if(payload.channel && payload.user){
      let service = channelService.in(payload.channel)

      //console.log(service)
      await service?.kickUser(payload.channel, payload.user, payload.reported)
    }
  }
};

export default actions;
