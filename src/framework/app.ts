import path from 'path'
import { Server } from 'hapi'
import _ from 'lodash'
import HealthCheck from './health-check'
import Security from './security'
import Router from './router'
import Docs from './docs'

export default class {
  options: AppOptions
  healthCheck: HealthCheck
  security: Security
  router: Router
  docs: Docs

  constructor(options?: AppOptions) {
    this.options = _.merge({}, DEFAULT_OPTIONS, options)
    this.healthCheck = new HealthCheck(this)
    this.security = new Security(this)
    this.router = new Router(this)
    this.docs = new Docs(this)
  }

  async start() {
    const server = await this.createServer()
    await this.healthCheck.bind(server)
    await this.security.loadStrategies(server)
    await this.router.registerRoutes(server)
    await this.docs.mountDocs(server)
    await server.start()
  }

  async createServer() {
    const { port, host } = this.options
    const server = new Server({
      debug: {
        log: ['*'],
        request: ['*'],
      },
      port,
      host,
      routes: {
        cors: {
          credentials: true,
        },
        validate: {
          options: {
            allowUnknown: true,
          },
          failAction: (request, h, err) => {
            console.error(err.toString())
            throw err
          },
        },
      },
    })
    server.events.on('start', () => {
      console.log(`Server running at: ${server.info.uri}`)
    })
    server.events.on('stop', () => {
      console.log('Server stopped')
    })
    process.on('unhandledRejection', err => {
      throw err
      process.exit(1)
    })
    return server
  }
}

export interface AppOptions {
  host: string
  port: number
  appDir: string
  ctrlDir: string
  authDir: string
  apiPrefix: string
  docPrefix: string
}

const DEFAULT_OPTIONS: AppOptions = {
  host: '0.0.0.0',
  port: 8080,
  appDir: path.join(path.resolve(__dirname, '../app')),
  ctrlDir: 'controllers',
  authDir: 'auths',
  apiPrefix: '/api',
  docPrefix: '/docs',
}
