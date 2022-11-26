import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'
import { channelService } from 'src/services'
import { RawMessage, Channel, SerializedMessage, User } from 'src/contracts'
import { api } from 'src/boot/axios'
import auth from 'src/boot/auth'

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

    console.log(leaving)

    leaving.forEach((c) => {
      channelService.leave(c)
      commit('CLEAR_CHANNEL', c)
      console.log("Leaving: " + c)
    })
  },
  async addMessage ({ commit }, { channel, message }: { channel: string, message: RawMessage }) {
    const newMessage = await channelService.in(channel)?.addMessage(message)
    commit('NEW_MESSAGE', { channel, message: newMessage })
  },

  async populateChannelList ({  state, rootState, commit }) {
    // first load of the channels and data from DB on mount of the page
    const channelsData = (await api.get('user/getChannels')).data
    
    for (const channel in channelsData) {
      if (Object.prototype.hasOwnProperty.call(channelsData, channel)) {
        const element = channelsData[channel];

        let found = false
        state.channels.forEach(existingChannel => {
          if(existingChannel.name == element.name || found)
            found = true;
        })

        if(!found){
          let tempChannel:Channel = { name: element.name, index: element.index, color: element.color, isPublic: element.isPublic, owner: element.owner}
          
          commit('ADD_CHANNEL', tempChannel)
          
          this.dispatch('channels/join', tempChannel.name, { root: true })          
        }
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

    const payload = { channel: channel, user: user?.username }

    const response = await api.delete<Channel>('channels/channel_user', { data: payload })
    
    this.dispatch('channels/removeChannel', channel);

    console.log(state.messages)
    
    await channelService.in(channel)?.removeChannel(channel)
    
    channelService.leave(channel)

    return response.data
  },

  async closeChannel({ commit, rootState, state }, channel: string ) {
    const user = rootState.auth.user

    const payload = { channel: channel, user: user?.username }

    const response = await api.delete<Channel>('channels/channel', { data: payload })
    
    this.dispatch('channels/removeChannel', channel);

    //TODO remove channel for everyone else
    await channelService.in(channel)?.removeChannel(channel)
    
    channelService.leave(channel)

    console.log(state.active)
    commit('SET_ACTIVE', 'general')
    console.log(state.active)

    return response.data
  },
    
  async removeChannel ({ commit }, channel: string) {
    commit('CLEAR_CHANNEL', channel)
    
    commit('REMOVE_CHANNEL', channel)
  },

  async setActiveChannel({commit, rootState, state}, channel: string) {
    const user = rootState.auth.user
    const payload = { channel: channel, user: user?.username }

    const users = await api.get('channels/users_in_chat', { params: payload });

    const parsedUsers:User[] = []
    users.data.forEach((user: { id: number; email: string; createdAt: string; updatedAt: string; username: string }) => {
      parsedUsers.push({ id: user.id, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt, username: user.username })
    });
    
    console.log(parsedUsers)
    console.log(channel)

    commit('SET_USERS', { parsed: parsedUsers as User[], channel } )
    //commit('CHANNEL_ADDED', { channel, messages: [] as unknown as SerializedMessage, members: {} as User[] })
    console.log(state.usersInChat[channel])

    commit('SET_ACTIVE', channel)
  }
}

export default actions
