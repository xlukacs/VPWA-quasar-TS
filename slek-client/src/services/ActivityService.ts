import { Channel, User } from 'src/contracts'
import { authManager } from '.'
import { BootParams, SocketManager } from './SocketManager'

class ActivitySocketManager extends SocketManager {
  public subscribe ({store} : BootParams): void {
    this.socket.on('user:list', (onlineUsers: User[]) => {
      // console.log('Online users list', onlineUsers)
    })

    this.socket.on('user:online', (user: User) => {
      // console.log('User is online', user)
    })

    this.socket.on('user:offline', (user: User) => {
      // console.log('User is offline', user)
    })

    this.socket.on('user:status', (user: User, status: String) => {
      // console.log(user)
      // console.log(status)
      store.dispatch('channels/setUserStatus', { user, status })
    })

    this.socket.on('user:gotInvited', async (username: string, channel: Channel) => {
      console.log(username, channel, 'INVITE')
      if(store.state.auth.user?.username == username){
        let payload = {channel: channel, isValid: false } 
        store.dispatch('channels/addChannelToList', payload, { root: true })
        console.log("DISPATCH INVITE", payload)
      }
    })

    authManager.onChange((token) => {
      if (token) {
        this.socket.connect()
      } else {
        this.socket.disconnect()
      }
    })
  }

  public setStatus (status: string, userName: string | undefined) {
    // console.log("ActivityService: " + status + '/' + userName);
    this.emitAsync('setStatus', {status:status, username:userName})
  }

  public sendInvite (channel: string, user: string) {
    console.log('EMIT invite client', channel, user)
    this.emitAsync('sendInvite', { channel:channel, user:user })
  }  
}

export default new ActivitySocketManager('/')
