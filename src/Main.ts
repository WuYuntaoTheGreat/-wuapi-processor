// vim: set ts=2 sw=2:

import { Project } from "./Definitions"
import { buildProject, verifyProject } from "./Build"
import dedent from "dedent-js"
import { BasePlugin, RepositoryPlugin, } from "@wuapi/generator"
import path from "path"
import _ from "lodash"
import { error, info, succeed, } from "./Log"
import {WebPlugin} from "./Web"

/**
 * Main class of 
 */
export class WuApi {
  VERSION = "1.0.1"

  generators = new Map<string, BasePlugin>()

  /**
   * Constructor.
   *
   * Add default generators.
   */
  constructor(){
    this.use(new RepositoryPlugin())
    this.use(new WebPlugin())
  }

  /**
   * Register a generator.
   * @param generator 
   */
  use(generator: BasePlugin){
    const desc = generator.getDescription()
    if(desc.abbreviation.length > 1){
      error(`Got invalid abbreviation: "${desc.abbreviation}" of generator "${desc.name}"`)
      error("generator abbreviation must be ONE letter only!")
      throw "generator abbreviation must be ONE letter only!"
    }
    if(this.generators.get(desc.abbreviation)){
      const oldDesc = this.generators.get(desc.abbreviation)?.getDescription()
      info(`replacing old generator named "${oldDesc?.name}" at "-${desc.abbreviation}" with a new one, named "${desc.name}".`)
    }
    this.generators.set(desc.abbreviation, generator)
  }

  version(){
    console.log(String.raw`
      __      __ _   _        ___  ___  ___ 
      \ \    / /| | | |      /   \| _ \|_ _|
       \ \/\/ / | |_| |      | - ||  _/ | | 
        \_/\_/   \___/       |_|_||_|  |___|
    `,
    `
              version: ${this.VERSION}

    `)
    console.log("Plugins:")

    for(let g of this.generators.values()){
      const desc = g.getDescription()
      console.log(dedent`

        ${desc.name}
        ====================
        abbreviation: ${desc.abbreviation}
        version: ${desc.version}
        description: ${desc.description}

      `)
    }
  }

  usage(){
    console.log(dedent`
      Usage:
      node script [options] <action>

      Options:
        -o <dir>  : Specify output dir.
        -h        : Display this help message.
        -V        : Display project version.

      Actions:
        -D        : Dump the whole project as JSON.
    `)

    for(let g of this.generators.values()){
      const desc = g.getDescription()
      console.log(`  -${desc.abbreviation}        : ${desc.description} `)
      let tags = _.map(desc.arguments, (a) => `    --${desc.abbreviation}-${a.tag} ${a.withValue ? "<value>" : ""}`)
      let max = _.max(_.map(tags, (a) => a.length)) ?? 0

      for (let i = 0; i < desc.arguments.length; i++){
        const padding = " ".repeat(max - tags[i].length)
        console.log(`${tags[i]}${padding} : ${desc.arguments[i].description}`)
      }
    }
  }

  main(args: string[], project: Project){
    const prj = buildProject(project)
    if(verifyProject(prj)){
      console.error("\n")
      succeed("Building succeeded!")
    } else {
      console.error("\n")
      error("Building succeeded!")
    }
    console.error("\n")

    let outDir = path.join(process.cwd(), 'out')
    let gens: {[key: string]: {
      generator: BasePlugin,
      args: {[key: string]: string},
    }} = {}

    var i: number = 2
    while (i < args.length){
      switch(args[i]){
        case '-o':
          i++
          outDir = args[i]
          break

        case '-h':
          this.usage()
          return

        case '-D':
          console.log(JSON.stringify(prj, undefined, 2))
          return

        case '-v':
          this.version()
          return

        case '-V':
          console.log(`Project: ${prj.name}`)
          console.log(`version: ${prj.version}`)
          return

        default: {
          const m1 = args[i].match(/^-([a-zA-Z])$/)
          const m2 = args[i].match(/^--([a-zA-Z])-([a-zA-Z0-9]+)$/)
          if(m1){
            const key = m1[1]
            const generator = this.generators.get(key)
            if(generator){
              gens[key] = {
                generator: generator!,
                args: {},
              }
            }
          } else if(m2){
            const key = m2[1]
            const arg = m2[2]
            const argConf = _.find(gens[key].generator.getDescription().arguments, (a) => a.tag == arg)
            if(argConf){
              let value = argConf.withValue ? args[++i] : ""
              gens[key].args[arg] = value
            }
          } else {
            error(`Unknown option "${args[i]}"`)
            this.usage()
            return
          }
        }
      }
      i++
    }

    // Do execute plugin.
    for(let key in gens){
      let gen = gens[key]
      gen.generator.process(prj, outDir, gen.args)
    }
  }

}
