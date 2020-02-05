import { Server } from 'hapi'
import inert from 'inert'
import vision from 'vision'
import Joi from 'joi'
import swaggered from 'hapi-swaggered'
import swaggeredUi from 'hapi-swaggered-ui'
import App from './app'
import { camelCase } from './utils'

export default class {
  private app: App

  constructor(app: App) {
    this.app = app
  }

  async mountDocs(server: Server) {
    const name = 'referrerapi'
    const version = null
    const { apiPrefix, docPrefix } = this.app.options

    const tags = this.app.router.getGroups()
    const securityDefs = this.app.security.getSwaggerSecurityDefs()

    await server.register([
      inert,
      vision,
      {
        plugin: swaggered,
        options: {
          requiredTags: [],
          stripPrefix: apiPrefix,
          tagging: {
            mode: 'tags',
          },
          tags,
          info: {
            title: name,
            version: version || '1.0.0',
          },
          auth: false,
          securityDefinitions: securityDefs,
        },
      },
      {
        plugin: swaggeredUi,
        options: {
          path: docPrefix,
          auth: false,
          swaggerOptions: {
            filter: true,
            docExpansion: 'list',
          },
        },
      },
    ])
  }

  betterModelName(routeOptions, ctrlName, actionName) {
    if (routeOptions.validate) {
      const { payload } = routeOptions.validate
      if (payload && !payload.isJoi) {
        const className = camelCase(ctrlName, actionName, 'req')
        routeOptions.validate.payload = Joi.object(payload).meta({ className })
      }
    }

    if (routeOptions.response) {
      const { schema } = routeOptions.response
      if (schema && !schema.isJoi) {
        const className = camelCase(ctrlName, actionName, 'res')
        routeOptions.response.schema = Joi.object(schema).meta({ className })
      }
    }
  }

  addSecurity(routeOptions) {
    if (!routeOptions.plugins) {
      routeOptions.plugins = {}
    }

    const security = this.app.security.getSwaggerRouteSecurity(routeOptions)
    routeOptions.plugins['hapi-swaggered'] = { security }
  }
}
