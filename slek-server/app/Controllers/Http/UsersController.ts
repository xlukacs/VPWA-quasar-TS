import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Channel from 'App/Models/Channel';
//import Channel from 'App/Models/Channel'
import User from 'App/Models/User'


export default class UsersController {
    async getChannels({ auth }: HttpContextContract) {
        const user = await User.query().where('id', '=', auth.user.id)

        const channels_prefetched = await User.query().where('id', '=', auth.user.id).preload('channels');
        //const channels_prefetched = await Database.from('channel_users').where('user_id', '=',  user.id)
        //console.log(channels_prefetched[0])
        //console.log(channels_prefetched[0].$preloaded.channels[0].$extras)
        // async () => {
        //     await Database.from('channel_users').where('user_id','=', user.id).select('channel_id')
        // })

        const publicChannels = await Channel.query().where('is_public', '=', 'true')

        var channels = []
        channels_prefetched[0].$preloaded.channels.forEach((channel) => {
            channels.push({ 
                name: channel.$attributes.name, 
                index: channel.$attributes.id, 
                color: channel.$attributes.color, 
                isPublic: channel.$attributes.isPublic, 
                owner: channel.$attributes.creator_id,
                valid: channel.$extras.pivot_valid
            })
        })

        publicChannels.forEach(channel => {
            let found = false
            channels.forEach(existingChannel => {
                if(existingChannel.name == channel.$attributes.name && !found)
                    found = true
            })

            if(!found)
                channels.push({ name: channel.name, index: channel.id, color: channel.color, isPublic: channel.isPublic, owner: channel.creator_id, valid: true })
        })

        //console.log(channels)

        return channels
    }
}
