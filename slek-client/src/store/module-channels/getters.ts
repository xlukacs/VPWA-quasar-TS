import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { ChannelsStateInterface } from './state'

const getters: GetterTree<ChannelsStateInterface, StateInterface> = {
  joinedChannels (context) {
    console.log(context.channels)
    return context.channels
  },
  currentMessages (context) {
    return context.active !== null ? context.messages[context.active] : []
  },
  getActiveChannelName (context){
    return context.active
  },
  lastMessageOf (context) {
    return (channel: string) => {
      //console.log(channel)
      if (channel == undefined)
        return null
        
      const messages = context.messages[channel]
      
      //console.log(context.channels)
      //console.log(messages)
      
      if(messages == undefined)
        return null

      //console.log(messages.length)

      return messages.length > 0 ? messages[messages.length - 1] : null
    }
  }
}

export default getters
