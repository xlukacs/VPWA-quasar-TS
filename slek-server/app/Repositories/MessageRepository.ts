import Database from '@ioc:Adonis/Lucid/Database'
import type { MessageRepositoryContract, SerializedMessage } from '@ioc:Repositories/MessageRepository'
import Channel from 'App/Models/Channel'

export default class MessageRepository implements MessageRepositoryContract {
  public async getAll(channelName: string, authID: number): Promise<SerializedMessage[]> {
    const tempChannel = await Channel.findByOrFail('name', channelName)
    const user = await Database.from('channel_users').where('channel_id', '=', tempChannel.id).where('user_id','=', authID).select('valid')

    if(user[0].valid){ 
      const channel = await Channel.query()
      .where('name', channelName)
      .preload('messages', (messagesQuery) => messagesQuery.preload('author'))
      .firstOrFail()
      
      return channel.messages.map((message) => message.serialize() as SerializedMessage)
    }else{
      let temp:SerializedMessage[] = []
      return temp
    }
  }

  public async create(channelName: string, userId: number, content: string): Promise<SerializedMessage> {
    const channel = await Channel.findByOrFail('name', channelName)
    const message = await channel.related('messages').create({ createdBy: userId, content })
    await message.load('author')

    return message.serialize() as SerializedMessage
  }
}
