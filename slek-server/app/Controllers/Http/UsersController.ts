import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel';
//import Channel from 'App/Models/Channel'
import User from 'App/Models/User'


export default class UsersController {
    async getChannels({ auth }: HttpContextContract) {
        const channels_prefetched = await User.query().where('id', '=', auth.user.id).preload('channels');

        const publicChannels = await Channel.query().where('is_public', '=', 'true')
        //console.log(publicChannels)

        var channels = []
        channels_prefetched[0].$preloaded.channels.forEach((channel) => {
            channels.push({ 
                name: channel.$attributes.name, 
                index: channel.$attributes.id, 
                color: channel.$attributes.color, 
                isPublic: channel.$attributes.isPublic, 
                owner: channel.$attributes.creator_id
            })
        })//TODO add owner from DB

        publicChannels.forEach(channel => {
            let found = false
            channels.forEach(existingChannel => {
                if(existingChannel.name == channel.$attributes.name && !found)
                    found = true
            })

            if(!found)
                channels.push({ name: channel.name, index: channel.id, color: channel.color, isPublic: channel.isPublic, owner: channel.creator_id })
        })

        //console.log(channels)

        return channels
    }
}
