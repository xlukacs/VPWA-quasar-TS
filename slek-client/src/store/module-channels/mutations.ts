import { SerializedMessage, Channel, User, Typer } from 'src/contracts'
import { MutationTree } from 'vuex'
import { ChannelsStateInterface } from './state'

const mutation: MutationTree<ChannelsStateInterface> = {
  LOADING_START (state) {
    state.loading = true
    state.error = null
  },
  LOADING_SUCCESS (state, { channel, messages }: { channel: string, messages: SerializedMessage[] }) {
    state.loading = false
    state.messages[channel] = messages
  },
  LOADING_ERROR (state, error) {
    state.loading = false
    state.error = error
  },
  CLEAR_CHANNEL (state, channel) {
    state.active = null
    state.usersInChat[channel] = []
    delete state.messages[channel]
  },
  SET_ACTIVE (state, channel: string) {
    state.active = channel

    state.channels.forEach(tempChannel => {
      if(tempChannel.name == channel)
        state.activeChannel = tempChannel;
    })
  },
  NEW_MESSAGE (state, { channel, message }: { channel: string, message: SerializedMessage }) {
    state.messages[channel].push(message)
  },
  ADD_CHANNEL(state, channel:Channel) {
    state.channels.push(channel)
  },
  CHANNEL_ADDED (state, { channel, messages, members }: { channel: string, messages: SerializedMessage[], activeChannel:Channel, members: User[]}) {
    state.loading = false
    state.messages[channel] = messages
    state.usersInChat[channel] = members
  },
  REMOVE_CHANNEL ( state, { channel } :  {channel: Channel}){
    state.channels.splice(state.channels.indexOf(channel), 1);
  },
  SET_USERS ( state, { parsed, channel } :  { parsed: User[], channel: string }){
    //console.log(parsed)
    //console.log(channel)
    state.usersInChat[channel] = parsed
  },
  CLEAR_CHANNELS(state){
    state.channels = []
  },
  SET_USER_STATUS(state, { user, status }: { user: number, status: string }){
    state.statuses[user] = status
  },
  ADD_TYPER(state, { username, message} : {username:string, message:string}){
    let channelName = state.activeChannel?.name ? state.activeChannel?.name : 'general'
    
    if(state.activeTypers[channelName] == undefined)
      state.activeTypers[channelName] = []

    let temp:Typer = { username: username, message: message } 

    var found = false
    var foundIndex = 0

    if(Array.isArray(state.activeTypers[channelName])){
      for (let i = 0; i < state.activeTypers[channelName].length; i++) {
        const typer = state.activeTypers[channelName][i];
        if(typer.username == temp.username || found){
          found = true
          foundIndex = i
        }
      }
      
      if(found)
        state.activeTypers[channelName][foundIndex].message = temp.message
      else
        state.activeTypers[channelName].push(temp)
    }
      
    for (let i = 0; i < state.activeTypers[channelName].length; i++) {
      const typer = state.activeTypers[channelName][i];
      if(typer.message == ''){
        state.activeTypers[channelName] = []
      }
    }
  },
  REMOVE_USER_FROM_CHANNEL ( state, { channel, user } :  { channel: string, user: User }){
    console.log("REMOVE")
    state.usersInChat[channel].splice(state.usersInChat[channel].indexOf(user), 1)
  },
  // CLEAR_TYPER(state, username:string){
  //   let channelName = state.activeChannel?.name ? state.activeChannel?.name : 'general'

  //   var found = false
  //   var foundIndex = 0
  //   for (let i = 0; i < state.activeTypers[channelName].length; i++) {
  //     const typer = state.activeTypers[channelName][i];
  //     if(typer.username == username || found){
  //       found = true
  //       foundIndex = i
  //     }
  //   }

  //   delete state.activeTypers[channelName][foundIndex]
  // }
}

export default mutation
