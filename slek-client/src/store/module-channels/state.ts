import { SerializedMessage, Channel, User } from 'src/contracts'

export interface ChannelsStateInterface {
  loading: boolean,
  error: Error | null,
  messages: { [channel: string]: SerializedMessage[] },
  usersInChat: { [channel: string]: User[] }
  active: string | null,
  channels: Channel[]
  activeChannel: Channel | null | undefined,
  statuses: string[]
}

function state (): ChannelsStateInterface {
  return {
    loading: false,
    error: null,
    messages: {},
    usersInChat: {},
    active: null,
    channels: [],
    activeChannel: null,
    statuses: []
  }
}

export default state
