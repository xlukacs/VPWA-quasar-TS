import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import ChannelCreationValidator from 'App/Validators/ChannelCreationValidator'
import RemoveUserValidator from 'App/Validators/RemoveUserValidator'

export default class ChannelsController {
  async createChannel({ auth, request }: HttpContextContract) {
    const validate = await request.validate(ChannelCreationValidator)
    validate['creator_id'] = auth.user?.id
    //console.log(validate)
    const channel = await Channel.create(validate)

    const user = await User.findByOrFail('id', auth.user!.id)
    await user.related('channels').attach([channel.id])

    return channel
  }

  async removeUser({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    const user = await User.findByOrFail('username', validate.user)
    const channel = await Channel.findByOrFail('name', validate.channel)

    await user.related('channels').detach([channel.id])

    if (user.id == channel.creator_id) await channel.delete()
  }

  async removeChannel({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    const user = await User.findByOrFail('username', validate.user)
    const channel = await Channel.findByOrFail('name', validate.channel)

    await user.related('channels').detach([channel.id])

    await channel.delete()
  }

  async usersInChat({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    const channel = await Channel.findByOrFail('name', validate.channel)
    var users_data_list = []

    const channel_users = await Database.from('channel_users').where('channel_id', '=', channel.id)
    for (let i = 0; i < channel_users.length; i++) {
      const channel = channel_users[i]

      const user_data = await User.query().where('id', '=', channel.user_id).select('*')
      users_data_list.push({
        id: user_data[0].$attributes.id,
        email: user_data[0].$attributes.email,
        createdAt: user_data[0].$attributes.createdAt,
        updatedAt: user_data[0].$attributes.updatedAt,
        username: user_data[0].$attributes.username,
        surname: user_data[0].$attributes.surname,
        firstname: user_data[0].$attributes.firstname,
        status: user_data[0].$attributes.status,
        picName: user_data[0].$attributes.pic_name,
      })
      //users_data_list.push(user_data)
    }

    return users_data_list
  }

  async createInvitation({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    const user = await User.findByOrFail('username', validate.user)
    const channel = await Channel.findByOrFail('name', validate.channel)

    //console.log(user.$attributes)
    //console.log(channel.$attributes)

    await Database.table('channel_users').insert({
      user_id: user.id,
      channel_id: channel.id,
    })
  }

  async getValidStatus({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    const user = await User.findByOrFail('username', validate.user)
    const channel = await Channel.findByOrFail('name', validate.channel)

    return await Database.from('channel_users')
      .where('channel_id', channel.id)
      .where('user_id', user.id)
      .select('valid')
  }

  async getChannelVisibility({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    //console.log(validate.channel)
    const channel = await Channel.findByOrFail('name', validate.channel)
    //const channel = Database.from('channels').where('name', validate.channel).select('is_public')


    return channel
  }

  async acceptInvite({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    const user = await User.findByOrFail('username', validate.user)
    const channel = await Channel.findByOrFail('name', validate.channel)

    const row = await Database.from('channel_users')
                    .where('channel_id', channel.id)
                    .where('user_id', user.id)
                    .select('id')


   if(row.length > 0){
     await Database.from('channel_users')
     .where('channel_id', channel.id)
     .where('user_id', user.id)
     .update('valid', true)
    }else{
      await Database.table('channel_users').insert({
        user_id: user.id,
        channel_id: channel.id,
      })

      await Database.from('channel_users')
      .where('channel_id', channel.id)
      .where('user_id', user.id)
      .update('valid', true)
    }
  }

  //SAME AS REVOKEINVITE
  async denyInvite({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    const user = await User.findByOrFail('username', validate.user)
    const channel = await Channel.findByOrFail('name', validate.channel)

    await Database.from('channel_users')
      .where('channel_id', channel.id)
      .where('user_id', user.id)
      .delete()
  }

  //SAME AS DENYINVITE
  async revokeInvite({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    const user = await User.findByOrFail('username', validate.user)
    const channel = await Channel.findByOrFail('name', validate.channel)

    await Database.from('channel_users')
      .where('channel_id', channel.id)
      .where('user_id', user.id)
      .delete()
  }


  async getChannelAvailability({ request }: HttpContextContract) {
    console.log(request)
    const validate = await request.validate(RemoveUserValidator)

    console.log(validate.user, validate.channel)

    try {
      const channel = await Channel.findByOrFail('name', validate.channel)
      
      return { status: "used", isPublic: channel[0].isPublic };
    } catch (error) {
      return { status: "unused", isPublic: null };
    }
  }

  async isUserValidInChannel({ request }: HttpContextContract) {
    const validate = await request.validate(RemoveUserValidator)

    return await Database.from("channel_users").where('channel_id','=', validate.channel).where('user_id','=',validate.user).select('valid')
  }
}
