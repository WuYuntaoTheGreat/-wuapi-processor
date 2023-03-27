import {
  GlobalEntity,
  GlobalEnum,
  Entity,
  Enum,
  EnumField,
  Field,
  ListField,
  Module,
  ObjectField,
  Project,
  UnknownField
} from './Definitions'

import {
  $ElementPath,
  $Entity,
  $Enum,
  $EnumItem,
  $Field,
  $FieldType,
  $Module,
  $Project,
  $TBoolean,
  $TDateTime,
  $TDouble,
  $TEnum,
  $TID,
  $TInteger,
  $TList,
  $TLong,
  $TObject,
  $TSSMap,
  $TString,
  $TUnknown,
  $TURL
} from '@wuapi/essential'
import _ from 'lodash'
import ForbiddenKeys from './ForbiddenKeys'
import { error, warning } from './Log'

/**
 * Generate a new WuApiProject object from this project.
 * @returns The WuApiProject generated
 */
export function buildProject(self: Project): $Project {
  const prj = new $Project(
    self.name,
    self.version,
    self.targetPackage,
  )

  self.modules.forEach((module, key) => {
    const mdl = buildModule(module) 
    prj.modules[key] = mdl
  })

  return prj
}

/**
 * Generate a new WuApiModule object from module.
 * @param self The {@link Module} object
 * @returns WuApiModule object generated
 */
function buildModule(
  self: Module,
): $Module {
  const mdl = new $Module()

  self.entities.forEach((entity, _) => {
    _traverseEntityTree(entity, self)
  })

  self.enums.forEach((enu, key) => {
    mdl.enums[key] = buildEnum(enu)
  })

  self.entities.forEach((entity, key) => {
    mdl.entities[key] = buildEntity(entity, self)
  })
  
  return mdl
}

/**
 * Preprocessor.
 * Recursively go through the entity, find all sub entities or enumerations, and add them to
 * the module object.
 * @param entity The entity object to check.
 * @param module The module where to where the new found entities or enums will be added to.
 */
function _traverseEntityTree(entity: Entity, module: Module){
  function checkField(field: Field){
    // check enum fields
    if(field instanceof EnumField){
      if(field.enu.name){
        module.enums.set(field.enu.name, field.enu.element)
      }
    }

    // check object fields
    if(field instanceof ObjectField){
      if(field.entity.name){
        module.entities.set(field.entity.name, field.entity.element)
        _traverseEntityTree(field.entity.element, module)
      }
    }

    // check list fields
    if(field instanceof ListField){
      checkField((field as ListField).member)
    }
  }

  if(entity.response != null && entity.response.name){
    const key = entity.response.name
    const ent = entity.response.element
    if(!ent.comment){
      ent.comment = entity.comment
    }
    module.entities.set(key, ent)
    _traverseEntityTree(ent, module)
  }

  entity.fields.forEach((field) => {
    checkField(field)
  })
  entity.knownMap.forEach((field) => {
    checkField(field)
  })

}

/**
 * Generate a new WuApiEnum object from enum.
 * @param self The {@link Enum} object
 * @returns WuApiEnum object generated
 */
function buildEnum(
  self: Enum,
): $Enum {
  const enu = new $Enum()

  enu.comment = self.comment

  self.items.forEach((item, key) => {
    const itm = new $EnumItem(item.value)
    itm.realname = item.realname
    itm.comment = item.comment
    enu.enumMap[key] = itm
  })

  return enu
}

/**
 * Find an entity from a project, and return the module name and entity name.
 * @param module The {@link Module} object, from where to find.
 * @param element The element object to find.
 * @returns 
 */
function _findModuleAndName(
  module: Module, 
  element: GlobalEnum | GlobalEntity
): $ElementPath {
  if(element.name){
    return new $ElementPath(module.name, element.name)
  } else {
    return _findModuleAndElementName(module, element.element)
  }
}

/**
 * Find an entity from a project, and return the module name and entity name.
 * @param module The {@link Module} object, from where to find.
 * @param element The element object to find.
 * @returns 
 */
function _findModuleAndElementName(
  module: Module, 
  element: Entity | Enum): $ElementPath {

  for(const m of module.project.modules.values()){
    const list: Map<string, Entity> | Map<string, Enum> = element instanceof Entity
      ? m.entities
      : m.enums

    for(const key of list.keys()){
      const e: Entity | Enum = list.get(key)!
      if(e == element){
        return new $ElementPath(m.name, key)
      }
    }
  }

  return new $ElementPath(null, null)
}

/**
 * Generate a new WuApiEntity object from entity.
 * @param self The {@link Entity} object
 * @param module The {@link Module} object
 * @returns WuApiEntity object generated
 */
function buildEntity(
  self: Entity,
  module: Module,
) {
  var ent = new $Entity(self.type)
  ent.isAbstract  = self.abstract
  ent.comment     = self.comment
  ent.path        = self.path
  ent.method      = self.method

  if(self.parent){
    ent.parent = _findModuleAndElementName(module, self.parent)
  }

  if(self.response){
    if(self.response?.name){
      ent.response = new $ElementPath(module.name, self.response!.name)
    } else if(self.response?.element){
      ent.response = _findModuleAndName(module, self.response)
    }
  }

  self.knownMap.forEach((field, key) => {
    ent.genericMap[key] = buildField(field, module)
  })

  self.fields.forEach((field, key) => {
    ent.fieldsLocal[key]= buildField(field, module)
  })

  return ent
}

/**
 * Generate a new WuApiField object from field.
 * @param self The {@link Field} object
 * @param module The {@link MOdeul} object
 * @returns WuApiField object generated
 */
function buildField(
  self: Field,
  module: Module,
): $Field {

  var type: $FieldType | null = null
  switch(self.constructor.name){
    case 'IntegerField'   : type = new $TInteger   (); break  
    case 'LongField'      : type = new $TLong      (); break  
    case 'DoubleField'    : type = new $TDouble    (); break  
    case 'IDField'        : type = new $TID        (); break  
    case 'URLField'       : type = new $TURL       (); break  
    case 'DateTimeField'  : type = new $TDateTime  (); break  
    case 'BooleanField'   : type = new $TBoolean   (); break  
    case 'StringField'    : type = new $TString    (); break  
    case 'SSMapField'     : type = new $TSSMap     (); break  

    case 'EnumField': {
      const result = _findModuleAndName(module, (self as EnumField).enu)
      type = new $TEnum(result)
      break
    }

    case 'ObjectField': {
      const result = _findModuleAndName(module, (self as ObjectField).entity)
      type = new $TObject(result)
      break
    }

    case 'ListField': {
      const _f = self as ListField
      type = new $TList(buildField(_f.member, module).type)
      break  
    }

    case 'UnknownField': {
      const _f = self as UnknownField
      type = new $TUnknown(_f.name)
      break  
    }

    default: {
      throw `Unknow field type: ${self.constructor.name}`
    }
  }

  const fld = new $Field(type!)
  fld.comment         = self.comment
  fld.fixedValue      = self.fixed
  fld.isOptional      = self.optional
  fld.isPathParameter = self.isPathParameter
  fld.realname        = self.realname
  fld.config          = self.config

  return fld 
}

/**
 * Verify a project.
 * @param project The project to verify
 * @returns true if there's no problem (may still have wanrings), false otherwise.
 */
export function verifyProject(project: $Project): boolean {
  let wrong = false
  let nameMap = new Map<string, $ElementPath>()

  // print path
  function pp(pth: $ElementPath): string {
    return `${pth.module}/${pth.name}`
  }

  // check standard C variable format
  function validName(name: string | null | undefined, location: string) {
    if(!name || !name.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/)){
      error(`${location}: "${name}" is not valid name. Should use standard C variable format`)
      wrong = true
    }
  }

  function keyword(name: string | null | undefined, location: string) {
    if(!name || ForbiddenKeys.indexOf(name) >= 0){
      error(`${location}: "${name}" is a keyword. Please use another name`)
      wrong = true
    }
  }

  ////////////////////
  // Check entity & enum names
  _.concat(
    _.map(project.flatEntities(), (o) => o.path),
    _.map(project.flatEnums(), (o) => o.path,)
  ).forEach((o) => {
    validName(o.name, `${pp(o)}`)
    keyword(  o.name, `${pp(o)}`)

    if(!o.name?.match(/^[A-Z]/)){
      warning(         `${pp(o)}: "${o.name}" should start with uppercase letter`)
    }

    const existing = nameMap.get(o.name!)
    if(existing){
      error(`Name "${pp(o)}" duplicates with "${pp(existing)}"`)
      wrong = true
    } else {
      nameMap.set(o.name!, o)
    }
  })

  ////////////////////
  // Check entity contents
  project.flatEntities().forEach(({path, entity}) => {
    // Check generic name
    entity.getGenericLocal().forEach( (g) => {
      validName(g, `${pp(path)}: Generic <${g}> `)

      if(!g.match(/^[A-Z]$/)){
        warning(   `${pp(path)}: Generic <${g}> should use single upper case letter.`)
      }
    })

    // Check fields
    _.forIn(entity.fieldsLocal, (_, name) => {
      validName(name, `${pp(path)}: Field "${name}" `)
      keyword(  name, `${pp(path)}: Field "${name}" `)

      if(!name.match(/^[a-z]/)){
        warning(      `${pp(path)}: Field "${name}" should start with lowercase letter.`)
      }
    })
  })

  ////////////////////
  // Check enum items
  project.flatEnums().forEach(({path, enu}) => {
    // Check items
    enu.flat().forEach((e) => {
      validName(e.name, `${pp(path)}: Item "${e.name}"`)
      keyword(  e.name, `${pp(path)}: Item "${e.name}"`)
    })
  })

  return !wrong
}
