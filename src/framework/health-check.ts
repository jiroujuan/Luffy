import { Server } from 'hapi'
import App from './app'

export default class {
  private app: App

  constructor(app: App) {
    this.app = app
  }

  async bind(server: Server) {
    server.route({
      method: 'GET',
      path: '/',
      options: {
        auth: false,
      },
      handler: (request, h) => {
        return h.redirect('/docs')
      },
    })

    server.route({
      method: 'GET',
      path: '/debug/health',
      options: {
        auth: false,
      },
      handler: (request, h) => {
        return h.response('ok').code(200)
      },
    })
  }
}
