"use strict";
// vim: set ts=2 sw=2:
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WuApi = void 0;
const DefProcessor_1 = require("./DefProcessor");
const dedent_js_1 = __importDefault(require("dedent-js"));
const generator_1 = require("@wuapi/generator");
const path_1 = __importDefault(require("path"));
const Log_1 = require("./Log");
/**
 * Main class of
 */
class WuApi {
    /**
     * Constructor.
     *
     * Add default generators.
     */
    constructor() {
        this.VERSION = "1.0.1";
        this.generators = new Map();
        this.use(new generator_1.RepositoryPlugin());
        this.use(new generator_1.JavaPlugin());
        this.use(new generator_1.SwiftPlugin());
    }
    /**
     * Register a generator.
     * @param generator
     */
    use(generator) {
        var _a;
        const desc = generator.getDescription();
        if (desc.abbreviation.length > 1) {
            (0, Log_1.error)(`Got invalid abbreviation: "${desc.abbreviation}" of generator "${desc.name}"`);
            (0, Log_1.error)("generator abbreviation must be ONE letter only!");
            throw "generator abbreviation must be ONE letter only!";
        }
        if (this.generators.get(desc.abbreviation)) {
            const oldDesc = (_a = this.generators.get(desc.abbreviation)) === null || _a === void 0 ? void 0 : _a.getDescription();
            (0, Log_1.info)(`replacing old generator named "${oldDesc === null || oldDesc === void 0 ? void 0 : oldDesc.name}" at "-${desc.abbreviation}" with a new one, named "${desc.name}".`);
        }
        this.generators.set(desc.abbreviation, generator);
    }
    version() {
        console.log(String.raw `
       ___  ___  ___  ___ 
      | __|/   \| _ \|_ _|
      | _| | - ||  _/ | | 
      |_|  |_|_||_|  |___|
    `, `
              version: ${this.VERSION}

    `);
        console.log("Plugins:");
        for (let g of this.generators.values()) {
            const desc = g.getDescription();
            console.log((0, dedent_js_1.default) `

        ${desc.name}
        ====================
        abbreviation: ${desc.abbreviation}
        version: ${desc.version}
        description: ${desc.description}

      `);
        }
    }
    usage() {
        console.log((0, dedent_js_1.default) `
      Usage:
      node script [options] <action>

      Options:
        -o <dir>  : Specify output dir.
        -h        : Display this help message.
        -V        : Display project version.

      Actions:
        -D        : Dump the whole project as JSON.
    `);
        for (let g of this.generators.values()) {
            const desc = g.getDescription();
            console.log(`  -${desc.abbreviation}        : ${desc.description} `);
        }
    }
    main(args, project) {
        var _a, _b;
        const prj = (0, DefProcessor_1.buildProject)(project);
        if ((0, DefProcessor_1.verifyProject)(prj)) {
            console.error("\n");
            (0, Log_1.succeed)("Building succeeded!");
        }
        else {
            console.error("\n");
            (0, Log_1.error)("Building succeeded!");
        }
        console.error("\n");
        let outDir = path_1.default.join(process.cwd(), 'out');
        var i = 2;
        while (i < args.length) {
            switch (args[i]) {
                case '-o':
                    i++;
                    outDir = args[i];
                    break;
                case '-h':
                    this.usage();
                    return;
                case '-D':
                    console.log(JSON.stringify(prj, undefined, 2));
                    return;
                case '-v':
                    this.version();
                    return;
                case '-V':
                    console.log(`Project: ${prj.name}`);
                    console.log(`version: ${prj.version}`);
                    return;
                default: {
                    const generator = this.generators.get((_b = (_a = args[i].match(/^-(.+)/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : "");
                    if (generator) {
                        generator.process(prj, outDir);
                    }
                    else {
                        (0, Log_1.error)(`Unknown option "${args[i]}"`);
                        this.usage();
                        return;
                    }
                }
            }
            i++;
        }
    }
}
exports.WuApi = WuApi;
