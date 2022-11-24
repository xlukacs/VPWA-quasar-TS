import { SerializedMessage, Channel, User } from 'src/contracts'

export interface ChannelsStateInterface {
  loading: boolean,
  error: Error | null,
  messages: { [channel: string]: SerializedMessage[] },
  usersInChat: { [userName: string]: User[] }
  active: string | null,
  channels: Channel[]
}

function state (): ChannelsStateInterface {
  return {
    loading: false,
    error: null,
    messages: {},
    usersInChat: {},
    active: null,
    channels: []
  }
}

export default state
