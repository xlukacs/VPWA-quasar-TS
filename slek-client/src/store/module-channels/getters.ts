import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'

const getters: GetterTree<ChannelsStateInterface, StateInterface> = {
  joinedChannels (context) {
    return context.channels
  },
  currentMessages (context) {
    return context.active !== null ? context.messages[context.active] : []
  },
  getActiveChannelName (context){
    return context.active
  },
  getActiveChannel(context){
    return context.activeChannel || 'Not in an active channel...'
  },
  getUsersInActiveChat(context){
    return context.active !== null ? context.usersInChat[context.active] : []
  },
  getChannelCreator(context){
    return context.activeChannel?.owner;
  },
  lastMessageOf (context) {
    return (channel: string) => {
      if (channel == undefined)
        return null
        
      const messages = context.messages[channel]
      
      
      if(messages == undefined)
        return null


      return messages.length > 0 ? messages[messages.length - 1] : null
    }
  }
}

export default getters
