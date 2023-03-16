// vim: set ts=2 sw=2:
import {$Project} from "@wuapi/essential"
import { BasePlugin, PluginDescription, RepositoryPlugin, } from "@wuapi/generator"
import path from 'path';
import ncp from 'ncp'

export class WebPlugin extends BasePlugin {

  getDescription(): PluginDescription {
    return {
      name: "web",
      abbreviation: "w",
      version: "1.0.0",
      description: "Generate a Json repository with web support.",
      arguments: [],
    }
  }

  process(project: $Project, outputDir: string): void {
    let srcDir = [__dirname, "..", "node_modules", "@wuapi", "web", "dist"].join(path.sep)
    let dstDir = [outputDir, this.getDescription().name].join(path.sep)


    ncp(srcDir, dstDir, (error) => {
      if(error) {
        return console.error(error)
      } else {
        (new RepositoryPlugin()).process(project, dstDir, {})
      }
    })

  }
}

