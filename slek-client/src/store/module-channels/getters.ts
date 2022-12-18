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
    return context.active || 'default'
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
  getChannelVisibility(context){
    return context.activeChannel?.isPublic
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
  },
  getStatuses (context) {
    //console.log(context.statuses)
    return context.statuses
  },
  getTyperCount(context){
    if(context.activeChannel?.name && context.activeTypers[context.activeChannel.name]){
      return context.activeTypers[context.activeChannel.name].length > 0 ? context.activeTypers[context.activeChannel.name].length : 0
    }

    return 0
  },
  getTypers(context){
    const tempChannelName = context.activeChannel?.name ? context.activeChannel?.name : 'general'
    return context.activeTypers[tempChannelName]
  }
}

export default getters
