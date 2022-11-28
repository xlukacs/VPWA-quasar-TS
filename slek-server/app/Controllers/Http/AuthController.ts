import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'
import { DateTime } from 'luxon'

export default class AuthController {
  async register({ request }: HttpContextContract) {
    const data = await request.validate(RegisterUserValidator)
    const user = await User.create(data)
    // join user to general channel
    //const general = await Channel.findByOrFail('name', 'general')
    //await user.related('channels').attach([general.id])

    const publicChannels = await Channel.query().where('is_public', '=', true)
    for (let i = 0; i < publicChannels.length; i++) {
      const channel = publicChannels[i];

      //await user.related('channels').attach([channel.id])
      await Database.table('channel_users').insert({ 
        user_id: user.id, 
        channel_id: channel.id,
        valid: true
    })
    }

    return user
  }

  async login({ auth, request }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    const dt = DateTime.local()
    await Channel.query()
    .limit(100)
    .whereHas('messages', (builder) => {
      builder.where('updated_at', '<', dt.plus({ days: -30 }).toSQLDate())
    })
    .delete()

    return auth.use('api').attempt(email, password)
  }

  async logout({ auth }: HttpContextContract) {
    return auth.use('api').logout()
  }

  async me({ auth }: HttpContextContract) {
    await auth.user!.load('channels')
    //console.log(auth.user)
    return auth.user
  }
}
