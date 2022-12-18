import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'
import ReportRequestValidator from 'App/Validators/ReportRequestValidator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class ActivityController {
  private getUserRoom(user: User): string {
    return `user:${user.id}`
  }

  public async onConnected({ socket, auth, logger }: WsContextContract) {
    // all connections for the same authenticated user will be in the room
    const room = this.getUserRoom(auth.user!)
    const userSockets = await socket.in(room).allSockets()

    // this is first connection for given user
    if (userSockets.size === 0) {
      socket.broadcast.emit('user:online', auth.user)
    }

    // add this socket to user room
    socket.join(room)
    // add userId to data shared between Socket.IO servers
    // https://socket.io/docs/v4/server-api/#namespacefetchsockets
    socket.data.userId = auth.user!.id

    const allSockets = await socket.nsp.except(room).fetchSockets()
    const onlineIds = new Set<number>()

    for (const remoteSocket of allSockets) {
      onlineIds.add(remoteSocket.data.userId)
    }

    const onlineUsers = await User.findMany([...onlineIds])

    socket.emit('user:list', onlineUsers)

    logger.info('new websocket connection')
  }

  // see https://socket.io/get-started/private-messaging-part-2/#disconnection-handler
  public async onDisconnected({ socket, auth, logger }: WsContextContract, reason: string) {
    const room = this.getUserRoom(auth.user!)
    const userSockets = await socket.in(room).allSockets()

    // user is disconnected
    if (userSockets.size === 0) {
      // notify other users
      socket.broadcast.emit('user:offline', auth.user)
    }

    logger.info('websocket disconnected', reason)
  }


  public async setStatus({ socket, auth }: WsContextContract, {status, username} : {status: string, username: string} ) {
    //console.log(username)
    //console.log(status)

    let user = await User.findByOrFail('username', username);
    user.status = status
    user.save()
    //console.log(user.status)

    socket.broadcast.emit('user:status', auth.user, status)
  }

  public async sendInvite({ socket }: WsContextContract, { channel, user }: {channel:string, user:string} ) { 
    const userData = await User.findByOrFail('username', user)
    const channelData = await Channel.findByOrFail('name', channel)

    console.log(userData, channelData)
    //delete possible bann
    try {
      await Database.from('reports').where('channel_id','=', channelData.id).where('reported_id','=', userData.id).delete()
    } catch (error) {
      console.log(error)
    }

    const inviteExists = await Database.from('channel_users').where('channel_id','=', channelData.id).where('user_id','=', userData.id)
    
    if(inviteExists.length == 0){
      await Database.table('channel_users').insert({
        user_id: userData.id,
        channel_id: channelData.id,
      })
    }    

    socket.broadcast.emit('user:gotInvited', userData.username, channelData)
  }

  public async revokeInvite({ socket }: WsContextContract, { channel, user }: {channel:string, user:string} ) { 
    const userData = await User.findByOrFail('username', user)
    const channelData = await Channel.findByOrFail('name', channel)

    console.log(userData, channelData)
    
    await Database.from('channel_users')
      .where('channel_id', channelData.id)
      .where('user_id', userData.id)
      .delete()  

    socket.broadcast.emit('user:revokedInvite', user, channelData.name)
  }
}
