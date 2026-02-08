import { boot } from 'quasar/wrappers'
import { Manager } from 'socket.io-client'
import { SocketManager } from 'src/services/SocketManager'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $io: Manager
  }
}

const DEMO_LOCKED = process.env.DEMO_LOCKED === 'true'

// Skip socket initialization entirely when the app is in demo/portfolio mode.
// This avoids mixed-content errors and unnecessary connections.
const io = DEMO_LOCKED ? null : SocketManager.createManager(undefined)

export default boot((params) => {
  if (DEMO_LOCKED || !io) return

  params.app.config.globalProperties.$io = io
  // boot socket manager here to allow to subscribe sockets to events and use store
  SocketManager.boot(params)
})

export { io }
