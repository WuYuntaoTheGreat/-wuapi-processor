"use strict";
// vim: set ts=2 sw=2:
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProject = exports.buildProject = void 0;
const Definitions_1 = require("./Definitions");
const essential_1 = require("@wuapi/essential");
const lodash_1 = __importDefault(require("lodash"));
const ForbiddenKeys_1 = __importDefault(require("./ForbiddenKeys"));
const Log_1 = require("./Log");
/**
 * Generate a new WuApiProject object from this project.
 * @returns The WuApiProject generated
 */
function buildProject(self) {
    const prj = new essential_1.$Project(self.name, self.version, self.targetPackage);
    self.modules.forEach((module, key) => {
        const mdl = buildModule(module);
        prj.modules[key] = mdl;
    });
    return prj;
}
exports.buildProject = buildProject;
/**
 * Generate a new WuApiModule object from module.
 * @param self The {@link Module} object
 * @returns WuApiModule object generated
 */
function buildModule(self) {
    const mdl = new essential_1.$Module();
    self.entities.forEach((entity, key) => {
        _traverseEntityTree(entity, self);
    });
    self.enums.forEach((enu, key) => {
        mdl.enums[key] = buildEnum(enu);
    });
    self.entities.forEach((entity, key) => {
        mdl.entities[key] = buildEntity(entity, self);
    });
    return mdl;
}
/**
 * 预处理
 * Recursively go through the entity, find all sub entities or enumerations, and add them to
 * the module object.
 * @param entity The entity object to check.
 * @param module The module where to where the new found entities or enums will be added to.
 */
function _traverseEntityTree(entity, module) {
    function checkField(field) {
        // check enum fields
        if (field instanceof Definitions_1.EnumField) {
            if (!(field.enu instanceof Definitions_1.Enum)) {
                const key = Object.keys(field.enu)[0];
                module.enums.set(key, field.enu[key]);
            }
        }
        // check object fields
        if (field instanceof Definitions_1.ObjectField) {
            if (!(field.entity instanceof Definitions_1.Entity)) {
                const key = Object.keys(field.entity)[0];
                const ent = field.entity[key];
                module.entities.set(key, ent);
                _traverseEntityTree(ent, module);
            }
        }
        // check list fields
        if (field instanceof Definitions_1.ListField) {
            checkField(field.member);
        }
    }
    if (entity.response != null && !(entity.response instanceof Definitions_1.Entity)) {
        const key = Object.keys(entity.response)[0];
        const ent = entity.response[key];
        if (!ent.comment) {
            ent.comment = entity.comment;
        }
        module.entities.set(key, ent);
        _traverseEntityTree(ent, module);
    }
    entity.fields.forEach((field) => {
        checkField(field);
    });
    entity.knownMap.forEach((field) => {
        checkField(field);
    });
}
/**
 * Generate a new WuApiEnum object from enum.
 * @param self The {@link Enum} object
 * @returns WuApiEnum object generated
 */
function buildEnum(self) {
    const enu = new essential_1.$Enum();
    enu.comment = self.comment;
    self.items.forEach((item, key) => {
        const itm = new essential_1.$EnumItem(item.value);
        itm.realname = item.realname;
        itm.comment = item.comment;
        enu.enumMap[key] = itm;
    });
    return enu;
}
/**
 * Find an entity from a project, and return the module name and entity name.
 * @param module The {@link Module} object, from where to find.
 * @param element The element object to find.
 * @returns
 */
function _findModuleAndName(module, element) {
    if (!(element instanceof Definitions_1.Entity) && !(element instanceof Definitions_1.Enum)) {
        const key = Object.keys(element)[0];
        return new essential_1.$ElementPath(module.name, key);
    }
    for (const m of module.project.modules.values()) {
        const list = element instanceof Definitions_1.Entity
            ? m.entities
            : m.enums;
        for (const key of list.keys()) {
            const e = list.get(key);
            if (e == element) {
                return new essential_1.$ElementPath(m.name, key);
            }
        }
    }
    return new essential_1.$ElementPath(null, null);
}
/**
 * Generate a new WuApiEntity object from entity.
 * @param self The {@link Entity} object
 * @param module The {@link Module} object
 * @returns WuApiEntity object generated
 */
function buildEntity(self, module) {
    var ent = new essential_1.$Entity(self.type);
    ent.isAbstract = self.abstract;
    ent.comment = self.comment;
    ent.path = self.path;
    ent.method = self.method;
    if (self.parent) {
        ent.parent = _findModuleAndName(module, self.parent);
    }
    if (self.response) {
        if (self.response instanceof Definitions_1.Entity) {
            ent.response = _findModuleAndName(module, self.response);
        }
        else {
            const key = Object.keys(self.response)[0];
            ent.response = new essential_1.$ElementPath(module.name, key);
        }
    }
    self.knownMap.forEach((field, key) => {
        ent.genericMap[key] = buildField(field, module);
    });
    self.fields.forEach((field, key) => {
        ent.fieldsLocal[key] = buildField(field, module);
    });
    return ent;
}
/**
 * Generate a new WuApiField object from field.
 * @param self The {@link Field} object
 * @param module The {@link MOdeul} object
 * @returns WuApiField object generated
 */
function buildField(self, module) {
    var type = null;
    switch (self.constructor.name) {
        case 'IntegerField':
            type = new essential_1.$TInteger();
            break;
        case 'LongField':
            type = new essential_1.$TLong();
            break;
        case 'DoubleField':
            type = new essential_1.$TDouble();
            break;
        case 'IDField':
            type = new essential_1.$TID();
            break;
        case 'URLField':
            type = new essential_1.$TURL();
            break;
        case 'DateTimeField':
            type = new essential_1.$TDateTime();
            break;
        case 'BooleanField':
            type = new essential_1.$TBoolean();
            break;
        case 'StringField':
            type = new essential_1.$TString();
            break;
        case 'SSMapField':
            type = new essential_1.$TSSMap();
            break;
        case 'EnumField': {
            const result = _findModuleAndName(module, self.enu);
            type = new essential_1.$TEnum(result);
            break;
        }
        case 'ObjectField': {
            const result = _findModuleAndName(module, self.entity);
            type = new essential_1.$TObject(result);
            break;
        }
        case 'ListField': {
            const _f = self;
            type = new essential_1.$TList(buildField(_f.member, module).type);
            break;
        }
        case 'UnknownField': {
            const _f = self;
            type = new essential_1.$TUnknown(_f.name);
            break;
        }
        default: {
            throw `Unknow field type: ${self.constructor.name}`;
        }
    }
    const fld = new essential_1.$Field(type);
    fld.comment = self.comment;
    fld.fixedValue = self.fixed;
    fld.isOptional = self.optional;
    fld.isPathParameter = self.isPathParameter;
    fld.realname = self.realname;
    return fld;
}
/**
 * Verify a project.
 * @param project The project to verify
 * @returns true if there's no problem (may still have wanrings), false otherwise.
 */
function verifyProject(project) {
    let wrong = false;
    let nameMap = new Map();
    // print path
    function pp(pth) {
        return `${pth.module}/${pth.name}`;
    }
    // check standard C variable format
    function validName(name, location) {
        if (!name || !name.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/)) {
            (0, Log_1.error)(`${location}: "${name}" is not valid name. Should use standard C variable format`);
            wrong = true;
        }
    }
    function keyword(name, location) {
        if (!name || ForbiddenKeys_1.default.indexOf(name) >= 0) {
            (0, Log_1.error)(`${location}: "${name}" is a keyword. Please use another name`);
            wrong = true;
        }
    }
    ////////////////////
    // Check entity & enum names
    lodash_1.default.concat(lodash_1.default.map(project.flatEntities(), (o) => o.path), lodash_1.default.map(project.flatEnums(), (o) => o.path)).forEach((o) => {
        var _a;
        validName(o.name, `${pp(o)}`);
        keyword(o.name, `${pp(o)}`);
        if (!((_a = o.name) === null || _a === void 0 ? void 0 : _a.match(/^[A-Z]/))) {
            (0, Log_1.warning)(`${pp(o)}: "${o.name}" should start with uppercase letter`);
        }
        const existing = nameMap.get(o.name);
        if (existing) {
            (0, Log_1.error)(`Name "${pp(o)}" duplicates with "${pp(existing)}"`);
            wrong = true;
        }
        else {
            nameMap.set(o.name, o);
        }
    });
    ////////////////////
    // Check entity contents
    project.flatEntities().forEach(({ path, entity }) => {
        // Check generic name
        entity.getGenericLocal().forEach((g) => {
            validName(g, `${pp(path)}: Generic <${g}> `);
            if (!g.match(/^[A-Z]$/)) {
                (0, Log_1.warning)(`${pp(path)}: Generic <${g}> should use single upper case letter.`);
            }
        });
        // Check fields
        lodash_1.default.forIn(entity.fieldsLocal, (entity, name) => {
            validName(name, `${pp(path)}: Field "${name}" `);
            keyword(name, `${pp(path)}: Field "${name}" `);
            if (!name.match(/^[a-z]/)) {
                (0, Log_1.warning)(`${pp(path)}: Field "${name}" should start with lowercase letter.`);
            }
        });
    });
    ////////////////////
    // Check enum items
    project.flatEnums().forEach(({ path, enu }) => {
        // Check items
        enu.flat().forEach(({ name, item }) => {
            validName(name, `${pp(path)}: Item "${name}"`);
            keyword(name, `${pp(path)}: Item "${name}"`);
        });
    });
    return !wrong;
}
exports.verifyProject = verifyProject;
