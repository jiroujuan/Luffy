import 'reflect-metadata'
import _ from 'lodash'

const META_KEY = 'framework:meta'

export default function(meta) {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor
  ) => {
    if (!propertyKey) {
      Reflect.defineMetadata(META_KEY, meta, target)
    } else {
      Reflect.defineMetadata(META_KEY, meta, target[propertyKey])
    }
  }
}

export function getMeta(target) {
  return _.clone(Reflect.getMetadata(META_KEY, target) || {})
}
