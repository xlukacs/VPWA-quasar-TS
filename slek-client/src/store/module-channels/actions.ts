import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'
import { channelService } from 'src/services'
import { RawMessage, Channel, SerializedMessage, User } from 'src/contracts'
import { api } from 'src/boot/axios'

const actions: ActionTree<ChannelsStateInterface, StateInterface> = {
  async join ({ commit }, channel: string) {
    try {
      commit('LOADING_START')
      const messages = await channelService.join(channel).loadMessages()
      //console.log(messages)
      commit('LOADING_SUCCESS', { channel, messages })
    } catch (err) {
      commit('LOADING_ERROR', err)
      throw err
    }
  },
  async leave ({ getters, commit }, channel: string | null) {
    const leaving: string[] = channel !== null ? [channel] : getters.joinedChannels

    leaving.forEach((c) => {
      channelService.leave(c)
      commit('CLEAR_CHANNEL', c)
    })
  },
  async addMessage ({ commit }, { channel, message }: { channel: string, message: RawMessage }) {
    const newMessage = await channelService.in(channel)?.addMessage(message)
    commit('NEW_MESSAGE', { channel, message: newMessage })
  },

  async populateChannelList ({ commit }) {
    // first load of the channels and data from DB on mount of the page
    const channelsData = (await api.get('user/getChannels')).data
    
    for (const channel in channelsData) {
      if (Object.prototype.hasOwnProperty.call(channelsData, channel)) {
        const element = channelsData[channel];

        let tempChannel:Channel = { name: element.name, index: element.index, color: 'orange', isPublic: false }
        
        commit('ADD_CHANNEL', tempChannel)

        this.dispatch('channels/join', tempChannel.name, { root: true })          
      }
    }
  },

  async addChannel({ commit }, data: Channel ) {
    const response  = await api.post<Channel>('channels/createChannel', data)
    const channel = response.data

    this.dispatch('channels/join', channel.name)
    commit('ADD_CHANNEL', channel)
    commit('CHANNEL_ADDED', { channel, messages: [] as unknown as SerializedMessage, members: {} as User[] })
    commit('SET_ACTIVE', channel)

    return channel
  },

  async leaveChannel({ commit, rootState, state }, channel: string ) {
    const user = rootState.auth.user
    console.log(user)
    // console.log(channel)
    // console.log(state.channels)
    //if (state.channels.includes(channel)) {
    // console.log("Removing:")
    // console.log(channel)
    const payload = { channel: channel, user: user?.username }
    console.log(payload)
    const response = await api.delete<Channel>('channels/channel_user', { data: payload })
    
    commit('REMOVE_CHANNEL', channel)
    
    await channelService.in(channel)?.removeChannel(channel)
    
    this.dispatch('channels/leave', channel, { root: true })
    
    return response.data
    //else{
    //  return null; // TODO what the hell happened here?
    //} 
  },
    
  async removeChannel ({ state, commit }, channel: string) {
    commit('REMOVE_CHANNEL', channel)
    
    if (state.active === channel) {
      commit('CLEAR_CHANNEL', channel)
    }
  }
}

export default actions
