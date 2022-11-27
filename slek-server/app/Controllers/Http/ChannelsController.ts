import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import ChannelCreationValidator from 'App/Validators/ChannelCreationValidator'
import RemoveUserValidator from 'App/Validators/RemoveUserValidator'

export default class ChannelsController {
    async createChannel({ auth, request }: HttpContextContract) {
        const validate = await request.validate(ChannelCreationValidator)
        validate['creator_id'] = auth.user?.id;
        //console.log(validate)
        const channel = await Channel.create(validate)

        const user = await User.findByOrFail('id', auth.user!.id)
        await user.related('channels').attach([channel.id])

        return channel
    }

    async removeUser({ auth, request }: HttpContextContract) {
        const validate = await request.validate(RemoveUserValidator)

        const user = await User.findByOrFail('username', validate.user)
        const channel = await Channel.findByOrFail('name', validate.channel)

        await user.related('channels').detach([channel.id])

        if(user.id == channel.creator_id)
            await channel.delete()
    }

    async removeChannel({ request } : HttpContextContract) {
        const validate = await request.validate(RemoveUserValidator)

        const user = await User.findByOrFail('username', validate.user)
        const channel = await Channel.findByOrFail('name', validate.channel)

        await user.related('channels').detach([channel.id])

        await channel.delete()
    }

    async usersInChat({ request }: HttpContextContract){
        const validate = await request.validate(RemoveUserValidator)

        const channel = await Channel.findByOrFail('name', validate.channel)
        //const users = await User.rela
        // const users = await User.query().preload('channels')

        // const users =   Database.rawQuery(
        //                     'select * FROM users JOIN channel_users ON users.id=channel_users.user_id WHERE channel_users.channel_id = :id',
        //                     {
        //                         id: channel.id,
        //                     }
        //                 )

        //console.log(users.knexQuery.client._events.start)
        //console.log("****************************************")
        //console.log(users.client)
        //console.log("****************************************")
        //console.log(users)

        //   .related('channels')
        //   .query()
        //   .pivotColumns(['channel_id'])
        //   .where('invite_pending', false)

        const users = await User.all()
        console.log(users)

        return users
    }

    async createInvitataion({ request }: HttpContextContract){
        const validate = await request.validate(RemoveUserValidator)

        const user = await User.findByOrFail('username', validate.user)
        const channel = await Channel.findByOrFail('name', validate.channel)

        await Database.table('channel_users').insert({ user_id: user.id, channel_id: channel.id })
    }
}
