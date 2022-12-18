import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'
import Database from '@ioc:Adonis/Lucid/Database'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject(['Repositories/MessageRepository'])
export default class MessageController {
  constructor (private messageRepository: MessageRepositoryContract) {}

  public async loadMessages({ params, auth }: WsContextContract) {
    if(auth.user?.id)
      return this.messageRepository.getAll(params.name, auth.user?.id)
    else
      return this.messageRepository.getAll(params.name, -1) //FALLBACK WHICH SHOULD NEVER RUN, BUT IF IT DOES IT WILL NOT RETURN ANY RECORDS FROM DB
  }

  public async addMessage({ params, socket, auth }: WsContextContract, content: string) {
    const message = await this.messageRepository.create(params.name, auth.user!.id, content)
    // broadcast message to other users in channel
    socket.broadcast.emit('message', message)

    const res = content.match("#[a-zA-Z]*")
   
    if(res){
      const mentionedUser = res[0].substring(1)

      socket.broadcast.emit('mentionUser', mentionedUser, content)
      console.log(mentionedUser)
    }

    // return message to sender
    return message
  }

  public async kickUser({ socket }: WsContextContract, data: any ) {
    const reporter = await User.findByOrFail('username', data.user)
    const reported = await User.findByOrFail('username', data.reported)
    const channel = await Channel.findByOrFail('name', data.channel)

    //TODO maybe create a more clevel version of this
    await Database.table('reports').insert({
      user_id: reporter.id,
      reported_id: reported.id,
      channel_id: channel.id
    })
    
    await Database.table('reports').insert({
      user_id: reporter.id,
      reported_id: reported.id,
      channel_id: channel.id
    })

    await Database.table('reports').insert({
      user_id: reporter.id,
      reported_id: reported.id,
      channel_id: channel.id
    })

    const reportCount = await Database.from('reports').where('reported_id','=',reported.id)
    if(reportCount.length >= 3){
      await Database.from('reports').where('reported_id','=',reported.id).where('channel_id','=',channel.id).delete()
      await Database.from('channel_users').where('user_id','=',reported.id).where('channel_id','=',channel.id).delete()

      socket.broadcast.emit('user:leave', reported.username, channel.name)
      socket.emit('user:removeFromChatUsers', reported.username, channel.name)
    }
  }

  public async reportUser({ socket }: WsContextContract, data: any ) {   
    const reporter = await User.findByOrFail('username', data.user)
    const reported = await User.findByOrFail('username', data.reported)
    const channel = await Channel.findByOrFail('name', data.channel)

    await Database.table('reports').insert({
      user_id: reporter.id,
      reported_id: reported.id,
      channel_id: channel.id
    })

    const reportCount = await Database.from('reports').where('reported_id','=',reported.id)
    if(reportCount.length >= 3){
      await Database.from('reports').where('reported_id','=',reported.id).where('channel_id','=',channel.id).delete()
      await Database.from('channel_users').where('user_id','=',reported.id).where('channel_id','=',channel.id).delete()
      
      socket.broadcast.emit('user:leave', reported.username, channel.name)
      socket.emit('user:removeFromChatUsers', reported.username, channel.name)
    }

  }

  public async broadcastTyping({ socket,auth }: WsContextContract, data: any ) { 
    socket.broadcast.emit('user:newMessageTyped', auth.user?.username, data)
  }

  public async userJoinedChannel({ socket,auth }: WsContextContract, data: any ) { 
    socket.broadcast.emit('user:userJoinedChannel', auth.user, data)
  }

  public async removeChannel({ socket }: WsContextContract, data: any ) { 
    socket.broadcast.emit('channel:channelRemoved', data)
  }

  public async removeUserFromList({ socket, auth }: WsContextContract, channel: any ) { 
    socket.broadcast.emit('channel:removeUserFromList', channel, auth.user?.username)
  }
}
