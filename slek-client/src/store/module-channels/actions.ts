import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'
import { channelService } from 'src/services'
import { RawMessage, Channel, SerializedMessage, User } from 'src/contracts'
import { api } from 'src/boot/axios'
import auth from 'src/boot/auth'
import ActivityService from 'src/services/ActivityService'
import ChannelService from 'src/services/ChannelService'

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

          
          const data  = (await api.get('channels/isUserValidInChannel', {params: { user: rootState.auth.user?.id, channel: tempChannel.index }}))
          
          //console.log("REEEEEEEEES", data)
          
          if(data.status == 200){
            commit('ADD_CHANNEL', tempChannel)
            let partOfChannel = data.data;   
            //console.log(partOfChannel, "partOfChannel")

            if(tempChannel.isPublic || partOfChannel[0].valid){
              this.dispatch('channels/join', tempChannel.name, { root: true })
              
              let innerPayload = {user: rootState.auth.user?.username, channel: tempChannel.name}
              const what = await api.get('channels/acceptInvitation', { params: innerPayload })
            }
          }
        }
      }
    }

    const dataFetched = (await api.get('user/getUserStatuses'))
    let usersData:User[] = dataFetched.data

    for (let i = 0; i < usersData.length; i++) {
      const user = usersData[i];
      
      ActivityService.setStatus(user.status, user.username);
    }

    //console.log(state.channels)
    //console.log(state.activeChannel)
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

  async addChannelToList({commit}, data: any){
    let tempChannel = data.channel
    tempChannel.isValid = data.isValid

    commit('ADD_CHANNEL', tempChannel)
  },

  async leaveChannel({ commit, rootState, state }, channel: string ) {
    //bradcast user removal
    if(rootState.auth.user?.username)
      await channelService.in(channel)?.removeUserFromList(channel)

    //remove from db
    const payload_revoke = { user: rootState.auth.user?.username, channel: channel }
    await api.get('channels/revokeInvite', { params: payload_revoke })

    //leave itself
    this.dispatch('channels/removeChannel', channel)
    channelService.leave(channel)
    commit('SET_ACTIVE', 'general')
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

  leaveChannelAndJoinGeneral({commit}, channel: string){
    channelService.leave(channel)

    console.log(channelService.in('general'))
    commit('SET_ACTIVE', 'general')
  },

  async removeChannel ({ commit }, channel: string) {
    //await ChannelService.leave(channel) //TODO maybe not even needed
    commit('CLEAR_CHANNEL', channel)

    commit('REMOVE_CHANNEL', channel)
  },

  async setActiveChannel({commit, rootState, state}, channel: string) {
    const user = rootState.auth.user
    const payload = { channel: channel, user: user?.username }
    
    const users = await api.get('channels/users_in_chat', { params: payload });
    
    var parsedUsers:User[] = []
    users.data.forEach((user: { id: number; email: string; createdAt: string; updatedAt: string; username: string, picName: string, status: string }) => {
      parsedUsers.push({ id: user.id, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt, username: user.username, picName: user.picName, status: user.status })
    
    });
    
    commit('SET_USERS', { parsed: parsedUsers as User[], channel } )
    
    commit("SET_USER_STATUS", { user: rootState.auth.user?.id, status: rootState.auth.user?.status })
    let temp = rootState.auth.user?.status ? rootState.auth.user?.status : 'offline'

    try {
      await ActivityService.setStatus(temp, rootState.auth.user?.username)
    } catch (error) {
      console.log(error)
    }
    
    commit('SET_ACTIVE', channel)
    
    try {
      let service = channelService.in(channel)
      await service?.userJoinedChannel(channel)
    } catch (error) {
      console.log(error)
    }
  },

  async inviteUser({ commit }, { channel, user } : { channel: string, user: string }){
    //const payload = { user: user, channel: channel }
    
    //await api.get('channels/createInvitation', { params: payload })

    try {
      console.log("INVITE ACTIVITY")
      await ActivityService.sendInvite(channel, user)
      
    } catch (error) {
      console.log("SMH went wrong here.")    
      console.log(error)    
    }
  },

  async setStatus ({ commit, rootState }, status: string ) {
    //status in global array 
    commit("SET_USER_STATUS", { user: rootState.auth.user?.id, status: status })
    
    //status for others
    const payload = { user: rootState.auth.user?.username, data: status }
    await ActivityService.setStatus(status, rootState.auth.user?.username)

    //save also on backend for next login
    await api.get('user/setStatus', { params: payload })

    //update clientside as well
    this.dispatch('user/setOwnStatus', status)
  },

  async setUserStatus({ commit }, { user, status }: { user: User, status: string }){
    commit("SET_USER_STATUS", { user: user.id, status: status })
  },

  async revokeUser({ commit }, { user, channel }: { user: string, channel: string }){
    const payload = { user: user, channel: channel }
    //await api.get('channels/revokeInvite', { params: payload })

    await ActivityService.revokeInvite(channel, user)
  },

  async addTyper({ commit }, { message, username }: { message: string, username: string }){
    commit("ADD_TYPER", { message: message, username: username })
  }, 

  async removeUserFromChannel({ commit }, { channel, user }: { channel: string, user: string }){
    const payload = { user: user, data: 'dummy' }

    const userObject = await api.get('user/getUser', { params: payload })

    commit("REMOVE_USER_FROM_CHANNEL", { channel: channel, user: userObject })
  },
  
  async tryJoinUser({ commit }, { channel, user }: { channel: string, user: User }){
    commit("TRY_JOIN_USER", { channel: channel, user: user })
  }    
}

export default actions
