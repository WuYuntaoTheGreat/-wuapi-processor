import { iEnum, iEnumItem, iCommentable, iField, iEntity } from './Interfaces';
import dedent from 'dedent-js';

import {
  $Commentable,
  $EntityType,
  $ReqMethod
} from '@wuapi/essential';

export type GlobalEnum   = { name: string | null, element: Enum }
export type GlobalEntity = { name: string | null, element: Entity }

/**
 * Wrapper of Essentual $Commentable.
 * Adding cmt() function.
 */
class Commentable<T> extends $Commentable implements iCommentable<T> {

  cmt(comment: string): T {
    this.comment = dedent(comment)
    return (this as any) as T
  }
}

/**
 * Enumeration item.
 */
export class EnumItem extends Commentable<iEnumItem> implements iEnumItem {
  realname: string | null = null

  /**
   * Constructor of enumeration item.
   * @param value The number value of the item, it's mandatory.
   */
  constructor( public value: number){ 
    super() 
  }

  ren(realname: string): iEnumItem {
    this.realname = realname
    return this
  }

  cnf(v: {[key: string]: string}): iEnumItem {
    this.config = v
    return this
  }
}

/**
 * Definition class of enumeration
 */
export class Enum extends Commentable<iEnum> implements iEnum {
  items = new Map<string, EnumItem>()

  setItems(config: {[key: string]: EnumItem}): Enum {
    for(let key in config){
      this.items.set(key, config[key])
    }
    return this
  }

  cnf(v: {[key: string]: string}): iEnum {
    this.config = v
    return this
  }
}

/**
 * Create an iEnum instance.
 * @returns newly created {@see iEnum } instance
 */
export function createEnum(): iEnum {
  return new Enum()
}

/**
 * Convenient function to create enumeration item.
 * @param v The number value of the new item.
 * @returns The newly created enumeration item.
 */
export function itm(v: number): EnumItem {
  var result = new EnumItem(v)
  return result
}

/**
 * Definition class of entity field
 */
export class Field extends Commentable<iField> implements iField {
  realname: string | null = null
  optional: boolean = false
  isPathParameter: boolean = false
  fixed: any | null = null
  config: {[key: string]: string} | null = null

  opt(): iField {
    this.optional = true
    return this
  }

  ren(realname: string): iField {
    this.realname = realname
    return this
  }

  pth(): iField {
    this.isPathParameter = true
    return this
  }

  fix(v: any | null): iField{
    this.fixed = v
    return this
  }

  cnf(v: {[key: string]: string}): iField{
    this.config = v
    return this
  }
}

export class IntegerField  extends Field {}
export class LongField     extends Field {}
export class DoubleField   extends Field {}
export class IDField       extends Field {}
export class URLField      extends Field {}
export class DateTimeField extends Field {}
export class BooleanField  extends Field {}
export class StringField   extends Field {}
export class SSMapField    extends Field {}

export class ListField     extends Field { constructor(public member: Field ){ super() } }
export class UnknownField  extends Field { constructor(public name:   string){ super() } }

export class EnumField extends Field {
  constructor(public enu: GlobalEnum){
    super()
  }
}

export class ObjectField extends Field {
  constructor(public entity: GlobalEntity){
    super()
  }
}

export function  int(): IntegerField { return new IntegerField  () }
export function  lng(): LongField    { return new LongField     () }
export function  dbl(): DoubleField  { return new DoubleField   () }
export function  idd(): IDField      { return new IDField       () }
export function  url(): URLField     { return new URLField      () }
export function  tim(): DateTimeField{ return new DateTimeField () }
export function  boo(): BooleanField { return new BooleanField  () }
export function  str(): StringField  { return new StringField   () }
export function  s2s(): SSMapField   { return new SSMapField    () }

export function  lst(member: Field    ): ListField    { return new ListField    (member) }
export function  unknown(name: string ): UnknownField { return new UnknownField (name  ) }

export function obj(elementOrName: iEntity | string, _element?: iEntity): ObjectField {
  return new ObjectField((typeof elementOrName === 'string')
      ? { name: elementOrName as string, element: _element as Entity }
      : { name: null, element: elementOrName as Entity }
  )
}

export function enu(elementOrName: iEnum | string, _element?: iEnum): EnumField {
  return new EnumField((typeof elementOrName === 'string')
      ? { name: elementOrName as string, element: _element as Enum }
      : { name: null, element: elementOrName as Enum }
  )
}


/**
 * Definition of object entity.
 */
export class Entity extends Commentable<iEntity> implements iEntity {
  abstract  = false
  fields    = new Map<string, Field>()
  knownMap  = new Map<string, Field>()
  type      = $EntityType.OBJECT
  response  : GlobalEntity | null = null
  path      : string | null = null
  parent    : Entity | null = null
  method    : $ReqMethod | null = null

  know(name: string, field: iField): iEntity {
    this.knownMap.set(name, field as Field)
    return this
  }

  setFields(config: {[key: string] : iField}): iEntity {
    for(let key in config){
      this.fields.set(key, config[key] as Field)
    }
    return this
  }
  
  setMethod(m: $ReqMethod | null | undefined): iEntity {
    this.method = m ?? null
    return this
  }

  abs(): iEntity {
    this.abstract = true
    return this
  }

  req(resOrName: iEntity | string, _res?: iEntity): iEntity {
    this.type = $EntityType.REQUEST
    this.response = (typeof resOrName === 'string')
      ? { name: resOrName as string, element: _res as Entity }
      : { name: null, element: resOrName as Entity }
    return this
  }

  res(): iEntity {
    this.type = $EntityType.RESPONSE
    return this
  }

  pth(path: string): iEntity {
    this.path = path
    return this
  }

  extends(_entity: iEntity): iEntity {
    const entity = _entity as Entity
    this.parent = entity
    if(entity.type != $EntityType.OBJECT){
      this.type = entity.type
    }
    if(!this.comment){
      this.comment = entity.comment
    }
    return this
  }

  cnf(v: {[key: string]: string}): iEntity {
    this.config = v
    return this
  }
}

export function createEntity(): iEntity {
  return new Entity()
}

/**
 * Definition of module.
 */
export class Module {
  entities = new Map<string, Entity>()
  enums = new Map<string, Enum>()

  /**
   * Constructor of module.
   * @param name The initial name of this module.
   * @param project The project where this module belongs to.
   * @param config The raw config object
   */
  constructor(
    public name: string,
    public project: Project,
    config: any,
  ){
    this.name = config['moduleName'] ?? name

    for(const key in config){
      const obj = config[key]

      if(obj instanceof Entity){
        this.entities.set(key, obj as Entity)
      }

      if(obj instanceof Enum){
        this.enums.set(key, obj as Enum)
      }
    }
  }
}

/**
 * Definition of project.
 */
export class Project{
  modules = new Map<string, Module>()

  /**
   * Constructor of project.
   * @param name The name of the project
   * @param version The version of the project
   * @param targetPackage The package (for Java & Kotlin) into which the entities 
   */
  constructor (
    public name: string,
    public version: string,
    public targetPackage: string
  ){}

  /**
   * Add modules to this project.
   * @param config Map of modules
   * @returns this project
   */
  setModules(config: {[key: string]: Object}): Project {
    for(var m in config){
      const module = new Module(m, this, config[m] as any)
      module.project = this
      this.modules.set(module.name, module)
    }

    return this
  }
}
