import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'
import { channelService } from 'src/services'
import { RawMessage, Channel, SerializedMessage, User } from 'src/contracts'
import { api } from 'src/boot/axios'
import auth from 'src/boot/auth'
import ActivityService from 'src/services/ActivityService'

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
    commit('CLEAR_CHANNELS')
    //console.log(state.channels)
    // first load of the channels and data from DB on mount of the page
    let payload = {user: rootState.auth.user?.username, data: 'temp'}
    const channelsData = (await api.get('user/getChannels', {params: payload})).data

    for (const channel in channelsData) {
      if (Object.prototype.hasOwnProperty.call(channelsData, channel)) {
        const element = channelsData[channel];

        let found = false
        state.channels.forEach(existingChannel => {
          if(existingChannel.name == element.name || found)
            found = true;
        })

        if(!found){
          let tempChannel:Channel = { name: element.name, index: element.index, color: element.color, isPublic: element.isPublic, owner: element.owner, valid: element.valid }

          commit('ADD_CHANNEL', tempChannel)

          this.dispatch('channels/join', tempChannel.name, { root: true })
        }
      }
    }

    //payload = {user: rootState.auth.user?.username, data: 'temp'}
    let usersData:User[] = (await api.get('user/getUserStatuses')).data

    //console.log(usersData)

    for (let i = 0; i < usersData.length; i++) {
      const user = usersData[i];
      
      ActivityService.setStatus(user.status, user.username);
    }
  },

  async addChannel({ commit, rootState }, data: Channel ) {
    const response  = await api.post<Channel>('channels/createChannel', data)
    let channel = response.data

    const user = rootState.auth.user
    const payload = { channel: channel.name, user: user?.username }
    await api.get('channels/acceptInvitation', { params: payload })
    channel.valid = true

    this.dispatch('channels/join', channel.name)
    commit('ADD_CHANNEL', channel)
    commit('CHANNEL_ADDED', { channel, messages: [] as unknown as SerializedMessage, members: {} as User[] })
    commit('SET_ACTIVE', channel)

    return channel
  },

  async leaveChannel({ commit, rootState, state }, channel: string ) {
    const user = rootState.auth.user
    // console.log(user)

    const payload = { channel: channel, user: user?.username }

    const response = await api.delete<Channel>('channels/channel_user', { data: payload })

    this.dispatch('channels/removeChannel', channel);

    //console.log(state.messages)

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

    console.log(channelService.in('general'))
    commit('SET_ACTIVE', 'general')
    //console.log(state.active)

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
    // console.log(users.data)
    
    var parsedUsers:User[] = []
    users.data.forEach((user: { id: number; email: string; createdAt: string; updatedAt: string; username: string, picName: string, status: string }) => {
      parsedUsers.push({ id: user.id, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt, username: user.username, picName: user.picName, status: user.status })
    });
    
    // console.log(parsedUsers)
    //console.log(channel)
    
    commit('SET_USERS', { parsed: parsedUsers as User[], channel } )
    //commit('CHANNEL_ADDED', { channel, messages: [] as unknown as SerializedMessage, members: {} as User[] })
    //console.log(state.usersInChat[channel])
    
    
    commit("SET_USER_STATUS", { user: rootState.auth.user?.id, status: rootState.auth.user?.status })
    let temp = rootState.auth.user?.status ? rootState.auth.user?.status : 'offline'
    await ActivityService.setStatus(temp, rootState.auth.user?.username)
    
    commit('SET_ACTIVE', channel)
  },

  async inviteUser({ commit }, { channel, user } : { channel: string, user: string }){
    const payload = { user: user, channel: channel }
    console.log(payload)
    const invitation = await api.get('channels/createInvitation', { params: payload })

    console.log(invitation)
  },

  async setStatus ({ commit, rootState }, status: string ) {
    commit("SET_USER_STATUS", { user: rootState.auth.user?.id, status: status })

    const payload = { user: rootState.auth.user?.username, data: status }

    await ActivityService.setStatus(status, rootState.auth.user?.username)

    await api.get('user/setStatus', { params: payload })
  },

  async setUserStatus({ commit }, { user, status }: { user: User, status: string }){
    commit("SET_USER_STATUS", { user: user.id, status: status })
  },

  async revokeUser({ commit }, { user, channel }: { user: string, channel: string }){
    const payload = { user: user, channel: channel }
    await api.get('channels/revokeInvite', { params: payload })
  }
}

export default actions
