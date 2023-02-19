import { Project } from "./Definitions";
import { BasePlugin } from "@wuapi/generator";
/**
 * Main class of
 */
export declare class WuApi {
    VERSION: string;
    generators: Map<string, BasePlugin>;
    /**
     * Constructor.
     *
     * Add default generators.
     */
    constructor();
    /**
     * Register a generator.
     * @param generator
     */
    use(generator: BasePlugin): void;
    version(): void;
    usage(): void;
    main(args: string[], project: Project): void;
}
