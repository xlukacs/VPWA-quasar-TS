import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'
import { channelService } from 'src/services'
import { RawMessage, Channel } from 'src/contracts'
import { api } from 'src/boot/axios'

const actions: ActionTree<ChannelsStateInterface, StateInterface> = {
  async join ({ commit }, channel: string) {
    try {
      commit('LOADING_START')
      const messages = await channelService.join(channel).loadMessages()
      commit('LOADING_SUCCESS', { channel, messages })
      console.log('Joined: ' + channel)
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
    console.log(channelsData)
    
    for (const channel in channelsData) {
      if (Object.prototype.hasOwnProperty.call(channelsData, channel)) {
        const element = channelsData[channel];
        let tempChannel:Channel = { name: element.name, index: element.index, color: 'orange', isPublic: false }
        commit('ADD_CHANNEL', tempChannel)
        this.dispatch('channels/join', tempChannel.name)  
      }
    }
    // for (let index = 0; index < recentChannelsData.length; index++) {
    //   commit('ADD_RECENT_CHANNEL', recentChannelsData[index])
    //   this.dispatch('channels/join', recentChannelsData[index].name, { root: true })
    // }
    // let found = false
    // const channelsData = (await api.get('channels')).data

    // for (let index = 0; index < channelsData.length; index++) {
    //   found = false
    //   for (let i = 0; i < recentChannelsData.length; i++) {
    //     if (recentChannelsData[i].name === channelsData[index].name) {
    //       found = true
    //       break
    //     }
    //   }
    //   if (!found) {
    //     this.dispatch('channels/join', channelsData[index].name, { root: true })
    //     commit('ADD_JOINED_CHANNEL', channelsData[index])
    //   }
    // }
    // const invitedChannelsData = (await api.get('invitedchannels')).data

    // for (let index = 0; index < invitedChannelsData.length; index++) {
    //   commit('ADD_INVITED_CHANNEL', invitedChannelsData[index])
    // }
    // get invited channels
  },
}

export default actions
