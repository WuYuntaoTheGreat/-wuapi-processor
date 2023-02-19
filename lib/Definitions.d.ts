import { iEnum, iEnumItem, iCommentable, iField, iEntity } from './Interfaces';
import { $Commentable, $EntityDirection, $EntityType, $ReqMethod } from '@wuapi/essential';
/**
 * Wrapper of Essentual $Commentable.
 * Adding cmt() function.
 */
declare class Commentable<T> extends $Commentable implements iCommentable<T> {
    cmt(comment: string): T;
}
/**
 * Enumeration item.
 */
export declare class EnumItem extends Commentable<iEnumItem> implements iEnumItem {
    value: number;
    realname: string | null;
    /**
     * Constructor of enumeration item.
     * @param value The number value of the item, it's mandatory.
     */
    constructor(value: number);
    ren(realname: string): iEnumItem;
}
/**
 * Definition class of enumeration
 */
export declare class Enum extends Commentable<iEnum> implements iEnum {
    items: Map<string, EnumItem>;
    setItems(config: {
        [key: string]: EnumItem;
    }): Enum;
}
/**
 * Create an iEnum instance.
 * @returns newly created {@see iEnum } instance
 */
export declare function createEnum(): iEnum;
/**
 * Convenient function to create enumeration item.
 * @param v The number value of the new item.
 * @returns The newly created enumeration item.
 */
export declare function itm(v: number): EnumItem;
/**
 * Definition class of entity field
 */
export declare class Field extends Commentable<iField> implements iField {
    realname: string | null;
    optional: boolean;
    isPathParameter: boolean;
    fixed: any | null;
    opt(): iField;
    ren(realname: string): iField;
    pth(): iField;
    fix(v: any | null): iField;
}
export declare class IntegerField extends Field {
}
export declare class LongField extends Field {
}
export declare class DoubleField extends Field {
}
export declare class IDField extends Field {
}
export declare class URLField extends Field {
}
export declare class DateTimeField extends Field {
}
export declare class BooleanField extends Field {
}
export declare class StringField extends Field {
}
export declare class SSMapField extends Field {
}
export declare class ListField extends Field {
    member: Field;
    constructor(member: Field);
}
export declare class UnknownField extends Field {
    name: string;
    constructor(name: string);
}
export declare class EnumField extends Field {
    enu: Enum | {
        [key: string]: Enum;
    };
    constructor(enu: Enum | {
        [key: string]: Enum;
    });
}
export declare class ObjectField extends Field {
    entity: Entity | {
        [key: string]: Entity;
    };
    constructor(entity: Entity | {
        [key: string]: Entity;
    });
}
export declare function int(): IntegerField;
export declare function lng(): LongField;
export declare function dbl(): DoubleField;
export declare function idd(): IDField;
export declare function url(): URLField;
export declare function tim(): DateTimeField;
export declare function boo(): BooleanField;
export declare function str(): StringField;
export declare function s2s(): SSMapField;
export declare function lst(member: Field): ListField;
export declare function unknown(name: string): UnknownField;
export declare function obj(element: iEntity | {
    [key: string]: iEntity;
}): ObjectField;
export declare function enu(element: iEnum | {
    [key: string]: iEnum;
}): EnumField;
/**
 * Definition of object entity.
 */
export declare class Entity extends Commentable<iEntity> implements iEntity {
    abstract: boolean;
    fields: Map<string, Field>;
    knownMap: Map<string, Field>;
    type: $EntityType;
    response: Entity | {
        [key: string]: Entity;
    } | null;
    path: string | null;
    parent: Entity | null;
    direction: $EntityDirection | null;
    method: $ReqMethod | null;
    know(name: string, field: iField): iEntity;
    setFields(config: {
        [key: string]: iField;
    }): iEntity;
    setMethod(m: $ReqMethod | null | undefined): iEntity;
    /**
     * Specify the direction of this entity to virgo to taurus.
     * @returns this entity
     */
    v2t(): iEntity;
    t2v(): iEntity;
    abs(): iEntity;
    req(res: iEntity | {
        [key: string]: iEntity;
    }): iEntity;
    res(): iEntity;
    pth(path: string): iEntity;
    extends(_entity: iEntity): iEntity;
}
export declare function createEntity(): iEntity;
/**
 * Definition of module.
 */
export declare class Module {
    name: string;
    project: Project;
    entities: Map<string, Entity>;
    enums: Map<string, Enum>;
    /**
     * Constructor of module.
     * @param name The initial name of this module.
     * @param project The project where this module belongs to.
     * @param config The raw config object
     */
    constructor(name: string, project: Project, config: any);
}
/**
 * Definition of project.
 */
export declare class Project {
    name: string;
    version: string;
    targetPackage: string;
    modules: Map<string, Module>;
    /**
     * Constructor of project.
     * @param name The name of the project
     * @param version The version of the project
     * @param targetPackage The package (for Java & Kotlin) into which the entities
     */
    constructor(name: string, version: string, targetPackage: string);
    /**
     * Add modules to this project.
     * @param config Map of modules
     * @returns this project
     */
    setModules(config: {
        [key: string]: Object;
    }): Project;
}
export {};
