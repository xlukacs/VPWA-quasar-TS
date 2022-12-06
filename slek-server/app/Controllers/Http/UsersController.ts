import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
//import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import UserRequestValidator from 'App/Validators/UserRequestValidator'


export default class UsersController {
    async getChannels({ request }: HttpContextContract) {
        console.log(request)
        const validate = await request.validate(UserRequestValidator)
        console.log(validate)
        const user = await User.findByOrFail('username', validate.user)

        const channels_prefetched = await User.query().where('id', '=', user.id ? user.id : 0).preload('channels');
        const publicChannels = await Channel.query().where('is_public', '=', 'true')

        var channels:Channel[] = []
        // : (name: string, index: number, color: string, isPublic: boolean, owner: number, valid: boolean)
        channels_prefetched[0].$preloaded.channels.forEach((channel) => {
          //channels.push(channel)
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
                //channels.push(channel)
        })


    return channels
  }


    async setStatus({ request }: HttpContextContract) {
        const validate = await request.validate(UserRequestValidator)
        const user = await User.findByOrFail('username', validate.user)

        await Database.from('users').where('id', '=', user.id).update('status', validate.data)
    }

    async getStatus({ request } : HttpContextContract){
        const validate = await request.validate(UserRequestValidator)
        const user = await User.findByOrFail('username', validate.user)

        return await Database.from('users').where('id', '=', user.id).select('status')
    }
}
