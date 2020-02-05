import path from 'path'
import _ from 'lodash'
import { Server } from 'hapi'
import App from './app'
import { getMeta } from './meta'
import { getAllFuncs, importAllDefaults } from './utils'

export default class {
  private app: App
  private groups = []

  constructor(app: App) {
    this.app = app
  }

  async registerRoutes(server: Server) {
    const { appDir, ctrlDir } = this.app.options
    const ctrlDirPath = path.join(appDir, ctrlDir)

    const ctrls = await importAllDefaults(ctrlDirPath)
    _.each(ctrls, async (clazz, name) => {
      await this.buildCtrl({ server, clazz, name })
    })
  }

  private async buildCtrl({ server, clazz, name }) {
    const ctrlMeta = getMeta(clazz)
    const actions = getAllFuncs(clazz)

    _.each(actions, async action => {
      await this.buildAction({
        server,
        ctrlName: name,
        ctrlMeta,
        ctrlClazz: clazz,
        action,
      })
    })

    this.groups.push({
      name,
      description: ctrlMeta.description,
    })
  }

  private async buildAction({ server, ctrlName, ctrlMeta, ctrlClazz, action }) {
    const actionName = action.name
    const actionMeta = getMeta(action)

    const { path: ctrlPath, method: ctrlMethod, ...ctrlOptions } = ctrlMeta

    const {
      path: actionPath,
      method: actionMethod,
      ...actionOptions
    } = actionMeta

    const { apiPrefix } = this.app.options

    const path = apiPrefix + (ctrlPath || '') + (actionPath || '')
    const method = (actionMethod || ctrlMethod || 'GET').toLowerCase()

    const options = {
      tags: [ctrlName],
      ...ctrlOptions,
      ...actionOptions,
    }

    this.app.docs.betterModelName(options, ctrlName, actionName)
    this.app.docs.addSecurity(options)

    server.route({
      method,
      path,
      options,
      handler: async (request, h) => {
        console.log(`path: ${request.path}, method: ${request.method} start`)
        console.log('params: ' + JSON.stringify(request.params))
        console.log('payload: ' + JSON.stringify(request.payload))
        console.log('query: ' + JSON.stringify(request.query))
        const ctrl = new ctrlClazz()
        const result = await action.call(ctrl, request, h)

        console.log(`path: ${request.path}, method: ${request.method} end `)
        return result
      },
    })
  }

  getGroups() {
    return this.groups
  }
}
