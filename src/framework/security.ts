import path from 'path'
import _ from 'lodash'
import { Server } from 'hapi'
import App from './app'
import { importAllDefaults } from './utils'

export default class {
  private app: App
  private strategies
  private defaultStrategy

  constructor(app: App) {
    this.app = app
  }

  getSwaggerRouteSecurity(routeOptions) {
    if (typeof routeOptions.auth === 'undefined') {
      return [{ [this.defaultStrategy]: [] }]
    }

    if (routeOptions.auth === false) {
      return null
    }

    if (typeof routeOptions.auth === 'string') {
      return [{ [routeOptions.auth]: [] }]
    }

    if (_.isArray(routeOptions.auth)) {
      const security = []
      _.each(routeOptions.auth, x => {
        security.push({ [x]: [] })
      })
      return security
    }

    throw new Error('Route auth not supported' + routeOptions.auth)
  }

  getSwaggerSecurityDefs() {
    const defs = {}
    _.each(this.strategies, (strategy, name) => {
      defs[name] = {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      }
    })
    return defs
  }

  async loadStrategies(server: Server) {
    const { appDir, authDir } = this.app.options
    const authDirPath = path.join(appDir, authDir)
    this.strategies = await importAllDefaults(authDirPath)

    _.each(this.strategies, (strategy, name) => {
      const { plugin, scheme, isDefault, ...options } = strategy
      if (plugin) {
        server.register(plugin, { once: true })
      }
      server.auth.strategy(name, scheme, options)
      if (isDefault) {
        server.auth.default(name)
        this.defaultStrategy = name
      }
    })
  }

  getStrategies() {
    return this.strategies
  }
}

interface SecurityStrategy {
  plugin?: any
  scheme: string
  isDefault?: boolean
  validate: Function
}
