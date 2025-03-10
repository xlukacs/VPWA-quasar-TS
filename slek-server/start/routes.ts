/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
  Route.get('me', 'AuthController.me').middleware('auth')
}).prefix('auth')

Route.group(() => {
  Route.get('getChannels', 'UsersController.getChannels').middleware('auth')

  Route.get('setStatus', 'UsersController.setStatus').middleware('auth')
  Route.get('getStatus', 'UsersController.getStatus').middleware('auth')

  Route.get('getUserStatuses', 'UsersController.getStatuses').middleware('auth')

  Route.get('getUser', 'UsersController.getUser').middleware('auth')

  Route.get('reportUser', 'UsersController.reportUser').middleware('auth')
  Route.get('kickUser', 'UsersController.kickUser').middleware('auth')
}).prefix('user')

Route.group(() => {
  Route.post('createChannel', 'ChannelsController.createChannel').middleware('auth')
  Route.delete('channel_user', 'ChannelsController.removeUser').middleware('auth')
  Route.delete('channel', 'ChannelsController.removeChannel').middleware('auth')
  Route.get('users_in_chat', 'ChannelsController.usersInChat').middleware('auth')
  Route.get('createInvitation', 'ChannelsController.createInvitation').middleware('auth')

  Route.get('acceptInvitation', 'ChannelsController.acceptInvite').middleware('auth')
  Route.get('denyInvitation', 'ChannelsController.denyInvite').middleware('auth')
  Route.get('revokeInvite', 'ChannelsController.revokeInvite').middleware('auth')
  Route.get('getValidStatus', 'ChannelsController.getValidStatus').middleware('auth')

  Route.get('getChannelVisibility', 'ChannelsController.getChannelVisibility').middleware('auth')
  Route.get('getChannelAvailability', 'ChannelsController.getChannelAvailability').middleware('auth')

  Route.get('isUserValidInChannel', 'ChannelsController.isUserValidInChannel').middleware('auth')
}).prefix('channels')
