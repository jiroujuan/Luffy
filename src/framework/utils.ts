import * as path from 'path'
import * as fs from 'fs'
import * as _ from 'lodash'

export function getAllFuncs(clazz: { new (): any }) {
  const functions = []
  let current = clazz.prototype
  while (current !== Object.prototype) {
    const allKeys = Object.getOwnPropertyNames(current)
    const funcKeys = _.filter(
      allKeys,
      x => _.isFunction(current[x]) && x !== 'constructor'
    )
    const funcs = _.map(funcKeys, x => current[x])
    functions.push(...funcs)
    current = Object.getPrototypeOf(current)
  }
  return functions
}

export function camelCase(...args: Array<string>) {
  if (args.length > 1) {
    return _.map(args, str => camelCase(str)).join('')
  } else if (args.length === 1) {
    const str = args[0]
    const first = str[0].toUpperCase()
    return first + str.substr(1)
  } else {
    return null
  }
}

export async function importAllDefaults(dir): Promise<{ [key: string]: any }> {
  const result = {}

  const files = fs.readdirSync(dir)

  _.each(files, async file => {
    const filePath = path.join(dir, file)
    const fileExt = path.extname(file)
    if (fileExt === '.ts' || fileExt === '.js') {
      const imported = await import(filePath)
      const name = path.basename(file, fileExt)
      result[name] = imported.default
    }
  })

  return result
}
