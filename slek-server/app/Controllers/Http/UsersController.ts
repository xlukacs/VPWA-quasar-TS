import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
//import Channel from 'App/Models/Channel'
import User from 'App/Models/User'


export default class UsersController {
    async getChannels({ auth }: HttpContextContract) {
        //const channels = await Channel.query().where('user_id', '=', auth.user.id)
        const channels_prefetched = await User.query().where('id', '=', auth.user.id).preload('channels');

        //console.log(channels_prefetched)
        //console.log(channels_prefetched[0].$preloaded.channels[0].$attributes.id)

        var channels = []

        channels_prefetched[0].$preloaded.channels.forEach((channel) => {
            channels.push({ name: channel.$attributes.name, index: channel.$attributes.id })
        })

        //console.log(channels)

        return channels
    }
}
