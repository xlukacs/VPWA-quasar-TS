import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    // const uniqueKey = 'email'

    // await User.updateOrCreateMany(uniqueKey, [
    //   {
    //     email: 'email@test.com',
    //     password: '$argon2id$v=19$t=3,m=4096,p=1$SoxQraYQ6JxAPN8gqh7wMw$6V7e90BP7zlH+lNhw2+o8JJNgpMVbzzQPUgfEzwwEDg'
    //   },
    // ])
  }
}
