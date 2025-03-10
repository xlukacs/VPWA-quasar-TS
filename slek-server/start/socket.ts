/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/')
  .connected('ActivityController.onConnected')
  .disconnected('ActivityController.onDisconnected')
  .on('setStatus', 'ActivityController.setStatus')
  .on('sendInvite', 'ActivityController.sendInvite')
  .on('revokeInvite', 'ActivityController.revokeInvite')

// this is dynamic namespace, in controller methods we can use params.name
Ws.namespace('channels/:name')
  // .middleware('channel') // check if user can join given channel
  .on('loadMessages', 'MessageController.loadMessages')
  .on('addMessage', 'MessageController.addMessage')
  .on('kickUser', 'MessageController.kickUser')
  .on('reportUser', 'MessageController.reportUser')
  .on('broadcastTyping', 'MessageController.broadcastTyping')
  .on('userJoined', 'MessageController.userJoinedChannel')
  .on('removeChannel', 'MessageController.removeChannel')
  .on('removeUserFromList', 'MessageController.removeUserFromList')

