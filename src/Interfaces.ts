import { $ReqMethod } from "@wuapi/essential"

export type iGlobalEnum   = { name: string | null, enum:   iEnum }
export type iGlobalEntity = { name: string | null, entity: iEntity }

export interface iCommentable<T> {
  /**
   * Set the comment of this field.
   * @param comment The comment
   * @returns this item
   */
  cmt(comment: string): T
}

export interface iEnumItem extends iCommentable<iEnumItem> {
  /**
   * Set the real name of this item.
   * @param realname The real name
   * @returns this this item
   */
  ren(realname: string): iEnumItem
}

/**
 * Definition interface of enumeration
 */
export interface iEnum extends iCommentable<iEnum> {
  /**
   * Fill this enumeration with items.
   * @param config Map of enumeration items.
   * @return this enumeration
   */
  setItems(config: {[key: string]: iEnumItem}): iEnum 
}

/**
 * Definition interface of entity field
 */
export interface iField extends iCommentable<iField> {

  /**
   * Mark this field as optional.
   * @returns this field
   */
  opt(): iField

  /**
   * Set the real name of this field.
   * @param realname The real name
   * @returns this field
   */
  ren(realname: string): iField

  /**
   * Mark this field as path parameter.
   * @returns this field
   */
  pth(): iField

  /**
   * Set the fixed value of this field.
   * @param v The fixed value
   * @returns this field
   */
  fix(v: any | null): iField

  /**
   * Set the configurations of this field.
   * @param v The configurations to set
   * @returns this field
   */
  cnf(v: {[key: string]: string}): iField
}

/**
 * Definition of object entity.
 */
export interface iEntity extends iCommentable<iEntity> {

  /**
   * Set a generic parameter of the entity.
   * @param name The name of know field
   * @param field The field definition.
   * @returns this entity
   */
  know(name: string, field: iField): iEntity

  /**
   * Fill this entity with fields
   * @param config Map of fields.
   * @returns this entity
   */
  setFields(config: {[key: string] : iField}): iEntity

  /**
   * Set the method of the entity.
   * @param m The method
   */
  setMethod(m: $ReqMethod | null | undefined): iEntity

  /**
   * Mark this entity as abstract.
   * @returns this entity
   */
  abs(): iEntity

  /**
   * Mark this entity as request entity, and set corresponding response.
   * @param resOrName The response entity or its name
   * @param _res If the [resOrName] is the name, this is the response entity
   * @returns this entity
   */
  req(resOrName: iEntity | string, _res?: iEntity): iEntity 

  /**
   * Mark this entity as response entity.
   * @returns this entity
   */
  res(): iEntity

  /**
   * Set the path, if this entity is a request.
   * @param path The path
   * @returns this entity
   */
  pth(path: string): iEntity

  /**
   * Set the parent entity.
   * @param entity The parent entity
   * @returns this entity
   */
  extends(entity: iEntity): iEntity 
}
