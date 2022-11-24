import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import ChannelCreationValidator from 'App/Validators/ChannelCreationValidator'
import RemoveUserValidator from 'App/Validators/RemoveUserValidator'

export default class ChannelsController {
    async createChannel({ auth, request }: HttpContextContract) {
        const validate = await request.validate(ChannelCreationValidator)
        validate['creator_id'] = auth.user?.id;
        console.log(validate)
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
}
