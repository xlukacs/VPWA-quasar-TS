import { Channel, RawMessage, SerializedMessage, User } from 'src/contracts'
import { channelService } from '.'
import { BootParams, SocketManager } from './SocketManager'
import { AppVisibility } from 'quasar'

// creating instance of this class automatically connects to given socket.io namespace
// subscribe is called with boot params, so you can use it to dispatch actions for socket events
// you have access to socket.io socket using this.socket
class ChannelSocketManager extends SocketManager {
  public subscribe ({ store }: BootParams): void {
    const channel = this.namespace.split('/').pop() as string

    this.socket.on('message', (message: SerializedMessage) => {
      store.commit('channels/NEW_MESSAGE', { channel, message })
    })

    this.socket.on('mentionUser', async (userMentioned: string, message: string) => {
      const canHaveInvites = AppVisibility.appVisible
      
      
      if(store.getters['user/getStatus'] == 'online'){ 
        if(store.state.auth.user?.username == userMentioned){
          if (Notification.permission === "granted" && canHaveInvites) {
            const notification = new Notification('You have been mentioned! ', { body: message })
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted" && canHaveInvites) {
                const notification = new Notification('You have been mentioned! ', { body: message })
              }
            })
          }
        }
      }
    })

    this.socket.on('removeChannel', async (channelName: string) => {
      store.dispatch('channels/removeChannel', channelName, { root: true })
    })

    this.socket.on('user:leave', async (username: string, channel: string) => {
      if(store.state.auth.user?.username == username)
        store.dispatch('channels/removeChannel', channel, { root: true })
    })

    this.socket.on('user:removeFromChatUsers', async (username: string, channel: string) => {
      let payload = {channel: channel, user: username } 
      store.dispatch('channels/removeUserFromChannel', payload)
    })
    
    this.socket.on('user:newMessageTyped', async (username: string, message: string) => {
      //console.log('user:newMessageTyped' + username + message)
      if(store.state.auth.user?.username != username){
        let payload = {message: message, username: username } 
        store.dispatch('channels/addTyper', payload, { root: true })
      }
    })

    this.socket.on('user:userJoinedChannel', async (user: User, channel: string) => {
      let payload = {channel: channel, username: user } 
      //console.log(payload)
      store.dispatch('channels/tryJoinUser', payload, { root: true })
    })

    this.socket.on('channel:channelRemoved', async (channel: string) => {
      store.dispatch('channels/removeChannel', channel, { root: true })
      store.dispatch('channels/leaveChannelAndJoinGeneral', channel, { root: true })
    })

    this.socket.on('channel:removeUserFromList', async (channel: string, user: string) => {
      let payload = {channel: channel, user: user } 
      store.dispatch('channels/removeUserFromChannel', payload)
    })
  }

  public addMessage (message: RawMessage): Promise<SerializedMessage> {
    return this.emitAsync('addMessage', message)
  }

  public loadMessages (): Promise<SerializedMessage[]> {
    return this.emitAsync('loadMessages')
  }

  public removeChannel (channel: string) {
    return this.emitAsync('removeChannel', channel)
  }

  public kickUser (channel: string, user: string, reported: string) {
    console.log({ channel, user, reported })
    return this.emitAsync('kickUser', { channel, user, reported })
  }

  public reportUser (channel: string, user: string, reported: string) {
    console.log({ channel, user, reported })
    return this.emitAsync('reportUser', { channel, user, reported })
  }

  public broadcastTyping(message: string){
    return this.emitAsync('broadcastTyping', message)
  }

  public userJoinedChannel(channel: string){
    this.emitAsync('userJoined', channel)
  }

  public removeUserFromList(channel: string){
    this.emitAsync('removeUserFromList', channel)
  }
}

class ChannelService {
  private channels: Map<string, ChannelSocketManager> = new Map()

  public join (name: string): ChannelSocketManager {
    console.log(name, "JOIN")
    if (this.channels.has(name)) {
      throw new Error(`User is already joined in channel "${name}"`)
    }

    // connect to given channel namespace
    const channel = new ChannelSocketManager(`/channels/${name}`)
    this.channels.set(name, channel)
    return channel
  }

  public leave (name: string): boolean {
    console.log("Leaving channel: "  + name)
    const channel = this.channels.get(name)

    if (!channel) {
      return false
    }

    // disconnect namespace and remove references to socket
    channel.destroy()
    return this.channels.delete(name)
  }

  public in (name: string): ChannelSocketManager | undefined {
    console.log(this.channels.get(name))
    return this.channels.get(name)
  }
}

export default new ChannelService()
