import { boot } from 'quasar/wrappers'
import { Manager } from 'socket.io-client'
import { SocketManager } from 'src/services/SocketManager'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $io: Manager
  }
}

// create socket.io manager
// Do not pass API_URL here — it is for REST calls only.
// Passing undefined lets socket.io-client auto-detect the origin & protocol
// (avoids mixed-content errors when the site is served over HTTPS via a tunnel/proxy).
const io = SocketManager.createManager(undefined)

export default boot((params) => {
  params.app.config.globalProperties.$io = io
  // boot socket manager here to allow to subscribe sockets to events and use store
  SocketManager.boot(params)
})

export { io }
