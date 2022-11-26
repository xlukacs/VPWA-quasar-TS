import { SerializedMessage, Channel, User } from 'src/contracts'
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
    console.log(parsed)
    console.log(channel)
    state.usersInChat[channel] = parsed
  }
}

export default mutation
