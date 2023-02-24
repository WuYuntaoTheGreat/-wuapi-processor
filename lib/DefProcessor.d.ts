import { Project } from './Definitions';
import { $Project } from '@wuapi/essential';
/**
 * Generate a new WuApiProject object from this project.
 * @returns The WuApiProject generated
 */
export declare function buildProject(self: Project): $Project;
/**
 * Verify a project.
 * @param project The project to verify
 * @returns true if there's no problem (may still have wanrings), false otherwise.
 */
export declare function verifyProject(project: $Project): boolean;
