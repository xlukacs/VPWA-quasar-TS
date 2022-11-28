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

        //const users = await User.all()
        var users_data = []
        
        const channel_users = await Database.from('channel_users').where('channel_id', '=', channel.id)
        for (let i = 0; i < channel_users.length; i++) {
            const channel = channel_users[i];

            const user_data = await User.query().where('id', '=', channel.user_id).select('*')
            users_data.push({
                id: user_data[0].$attributes.id,
                email: user_data[0].$attributes.email,
                createdAt: user_data[0].$attributes.createdAt,
                updatedAt: user_data[0].$attributes.updatedAt,
                username: user_data[0].$attributes.username,
                surname: user_data[0].$attributes.surname,
                firstname: user_data[0].$attributes.firstname,
                status: user_data[0].$attributes.status,
                picName: user_data[0].$attributes.pic_name
            })
        }
        // channel_users.forEach(async (channel, test) => {
        //     const user_data = await User.query().where('id', '=', channel.user_id).select('*')
        //     console.log(test)
        //     users_data.push({
        //         id: user_data[0].$attributes.id,
        //         email: user_data[0].$attributes.email,
        //         createdAt: user_data[0].$attributes.createdAt,
        //         updatedAt: user_data[0].$attributes.updatedAt,
        //         username: user_data[0].$attributes.username,
        //         surname: user_data[0].$attributes.surname,
        //         firstname: user_data[0].$attributes.firstname,
        //         status: user_data[0].$attributes.status,
        //         picName: user_data[0].$attributes.pic_name
        //     })
        // });
        console.log("Returning:")
        console.log(users_data)

        return users_data
    }

    async createInvitation({ request }: HttpContextContract){
        const validate = await request.validate(RemoveUserValidator)

        const user = await User.findByOrFail('username', validate.user)
        const channel = await Channel.findByOrFail('name', validate.channel)

        console.log(user.$attributes)
        console.log(channel.$attributes)

    
        await Database.table('channel_users').insert({ 
            user_id: user.id, 
            channel_id: channel.id
        })
    }

    async getValidStatus({ request }: HttpContextContract){
        const validate = await request.validate(RemoveUserValidator)

        const user = await User.findByOrFail('username', validate.user)
        const channel = await Channel.findByOrFail('name', validate.channel)

        return await Database.from('channel_users').where('channel_id', channel.id).where('user_id', user.id).select('valid')
    }

    async getChannelVisibility({ request }: HttpContextContract){
        const validate = await request.validate(RemoveUserValidator)

        const channel = await Channel.findByOrFail('name', validate.channel)

        return channel.isPublic
    }

    async acceptInvite({ request }: HttpContextContract){
        const validate = await request.validate(RemoveUserValidator)

        const user = await User.findByOrFail('username', validate.user)
        const channel = await Channel.findByOrFail('name', validate.channel)

        await Database.from('channel_users').where('channel_id', channel.id).where('user_id', user.id).update('valid', true)
    }

    async denyInvite({ request }: HttpContextContract){
        const validate = await request.validate(RemoveUserValidator)

        const user = await User.findByOrFail('username', validate.user)
        const channel = await Channel.findByOrFail('name', validate.channel)

        await Database  .from('channel_users')
                        .where('channel_id', channel.id)
                        .where('user_id', user.id)
                        .delete()
    }
}
