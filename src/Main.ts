// vim: set ts=2 sw=2:

import { Project } from "./Definitions"
import { buildProject, verifyProject } from "./DefProcessor"
import dedent from "dedent-js"
import { BasePlugin, JavaPlugin, RepositoryPlugin, SwiftPlugin } from "@wuapi/generator"
import path from "path"
import _ from "lodash"
import { error, info, succeed, warning } from "./Log"

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
    this.use(new JavaPlugin())
    this.use(new SwiftPlugin())
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
       ___  ___  ___  ___ 
      | __|/   \| _ \|_ _|
      | _| | - ||  _/ | | 
      |_|  |_|_||_|  |___|
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
          const generator = this.generators.get(args[i].match(/^-(.+)/)?.[1] ?? "")
          if(generator){
            generator.process(prj, outDir)
          } else {
            error(`Unknown option "${args[i]}"`)
            this.usage()
            return
          }
        }
      }
      i++
    }
  }

}