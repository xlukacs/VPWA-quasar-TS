import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import ChannelCreationValidator from 'App/Validators/ChannelCreationValidator'

export default class ChannelsController {
    async createChannel({ auth, request }: HttpContextContract) {
        const validate = await request.validate(ChannelCreationValidator)
        console.log(validate)
        const channel = await Channel.create(validate)

        const user = await User.findByOrFail('id', auth.user!.id)
        await user.related('channels').attach([channel.id])

        return channel
    }
}
