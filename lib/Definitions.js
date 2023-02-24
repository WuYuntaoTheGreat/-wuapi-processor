"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = exports.Module = exports.createEntity = exports.Entity = exports.enu = exports.obj = exports.unknown = exports.lst = exports.s2s = exports.str = exports.boo = exports.tim = exports.url = exports.idd = exports.dbl = exports.lng = exports.int = exports.ObjectField = exports.EnumField = exports.UnknownField = exports.ListField = exports.SSMapField = exports.StringField = exports.BooleanField = exports.DateTimeField = exports.URLField = exports.IDField = exports.DoubleField = exports.LongField = exports.IntegerField = exports.Field = exports.itm = exports.createEnum = exports.Enum = exports.EnumItem = void 0;
const dedent_js_1 = __importDefault(require("dedent-js"));
const essential_1 = require("@wuapi/essential");
function translateEntityOrMap(res) {
    if (res instanceof Entity) {
        return res;
    }
    else {
        const key = Object.keys(res)[0];
        let result = {};
        result[key] = res[key];
        return result;
    }
}
function translateEnumOrMap(res) {
    if (res instanceof Enum) {
        return res;
    }
    else {
        const key = Object.keys(res)[0];
        let result = {};
        result[key] = res[key];
        return result;
    }
}
/**
 * Wrapper of Essentual $Commentable.
 * Adding cmt() function.
 */
class Commentable extends essential_1.$Commentable {
    cmt(comment) {
        this.comment = (0, dedent_js_1.default)(comment);
        return this;
    }
}
/**
 * Enumeration item.
 */
class EnumItem extends Commentable {
    /**
     * Constructor of enumeration item.
     * @param value The number value of the item, it's mandatory.
     */
    constructor(value) {
        super();
        this.value = value;
        this.realname = null;
    }
    ren(realname) {
        this.realname = realname;
        return this;
    }
}
exports.EnumItem = EnumItem;
/**
 * Definition class of enumeration
 */
class Enum extends Commentable {
    constructor() {
        super(...arguments);
        this.items = new Map();
    }
    setItems(config) {
        for (let key in config) {
            this.items.set(key, config[key]);
        }
        return this;
    }
}
exports.Enum = Enum;
/**
 * Create an iEnum instance.
 * @returns newly created {@see iEnum } instance
 */
function createEnum() {
    return new Enum();
}
exports.createEnum = createEnum;
/**
 * Convenient function to create enumeration item.
 * @param v The number value of the new item.
 * @returns The newly created enumeration item.
 */
function itm(v) {
    var result = new EnumItem(v);
    return result;
}
exports.itm = itm;
/**
 * Definition class of entity field
 */
class Field extends Commentable {
    constructor() {
        super(...arguments);
        this.realname = null;
        this.optional = false;
        this.isPathParameter = false;
        this.fixed = null;
    }
    opt() {
        this.optional = true;
        return this;
    }
    ren(realname) {
        this.realname = realname;
        return this;
    }
    pth() {
        this.isPathParameter = true;
        return this;
    }
    fix(v) {
        this.fixed = v;
        return this;
    }
}
exports.Field = Field;
class IntegerField extends Field {
}
exports.IntegerField = IntegerField;
class LongField extends Field {
}
exports.LongField = LongField;
class DoubleField extends Field {
}
exports.DoubleField = DoubleField;
class IDField extends Field {
}
exports.IDField = IDField;
class URLField extends Field {
}
exports.URLField = URLField;
class DateTimeField extends Field {
}
exports.DateTimeField = DateTimeField;
class BooleanField extends Field {
}
exports.BooleanField = BooleanField;
class StringField extends Field {
}
exports.StringField = StringField;
class SSMapField extends Field {
}
exports.SSMapField = SSMapField;
class ListField extends Field {
    constructor(member) {
        super();
        this.member = member;
    }
}
exports.ListField = ListField;
class UnknownField extends Field {
    constructor(name) {
        super();
        this.name = name;
    }
}
exports.UnknownField = UnknownField;
class EnumField extends Field {
    constructor(enu) {
        super();
        this.enu = enu;
    }
}
exports.EnumField = EnumField;
class ObjectField extends Field {
    constructor(entity) {
        super();
        this.entity = entity;
    }
}
exports.ObjectField = ObjectField;
function int() { return new IntegerField(); }
exports.int = int;
function lng() { return new LongField(); }
exports.lng = lng;
function dbl() { return new DoubleField(); }
exports.dbl = dbl;
function idd() { return new IDField(); }
exports.idd = idd;
function url() { return new URLField(); }
exports.url = url;
function tim() { return new DateTimeField(); }
exports.tim = tim;
function boo() { return new BooleanField(); }
exports.boo = boo;
function str() { return new StringField(); }
exports.str = str;
function s2s() { return new SSMapField(); }
exports.s2s = s2s;
function lst(member) { return new ListField(member); }
exports.lst = lst;
function unknown(name) { return new UnknownField(name); }
exports.unknown = unknown;
function obj(element) {
    return new ObjectField(translateEntityOrMap(element));
}
exports.obj = obj;
function enu(element) {
    return new EnumField(translateEnumOrMap(element));
}
exports.enu = enu;
/**
 * Definition of object entity.
 */
class Entity extends Commentable {
    constructor() {
        super(...arguments);
        this.abstract = false;
        this.fields = new Map();
        this.knownMap = new Map();
        this.type = essential_1.$EntityType.OBJECT;
        this.response = null;
        this.path = null;
        this.parent = null;
        this.method = null;
    }
    know(name, field) {
        this.knownMap.set(name, field);
        return this;
    }
    setFields(config) {
        for (let key in config) {
            this.fields.set(key, config[key]);
        }
        return this;
    }
    setMethod(m) {
        this.method = m !== null && m !== void 0 ? m : null;
        return this;
    }
    abs() {
        this.abstract = true;
        return this;
    }
    req(res) {
        this.type = essential_1.$EntityType.REQUEST;
        this.response = translateEntityOrMap(res);
        return this;
    }
    res() {
        this.type = essential_1.$EntityType.RESPONSE;
        return this;
    }
    pth(path) {
        this.path = path;
        return this;
    }
    extends(_entity) {
        const entity = _entity;
        this.parent = entity;
        if (entity.type != essential_1.$EntityType.OBJECT) {
            this.type = entity.type;
        }
        if (!this.comment) {
            this.comment = entity.comment;
        }
        return this;
    }
}
exports.Entity = Entity;
function createEntity() {
    return new Entity();
}
exports.createEntity = createEntity;
/**
 * Definition of module.
 */
class Module {
    /**
     * Constructor of module.
     * @param name The initial name of this module.
     * @param project The project where this module belongs to.
     * @param config The raw config object
     */
    constructor(name, project, config) {
        var _a;
        this.name = name;
        this.project = project;
        this.entities = new Map();
        this.enums = new Map();
        this.name = (_a = config['moduleName']) !== null && _a !== void 0 ? _a : name;
        for (const key in config) {
            const obj = config[key];
            if (obj instanceof Entity) {
                this.entities.set(key, obj);
            }
            if (obj instanceof Enum) {
                this.enums.set(key, obj);
            }
        }
    }
}
exports.Module = Module;
/**
 * Definition of project.
 */
class Project {
    /**
     * Constructor of project.
     * @param name The name of the project
     * @param version The version of the project
     * @param targetPackage The package (for Java & Kotlin) into which the entities
     */
    constructor(name, version, targetPackage) {
        this.name = name;
        this.version = version;
        this.targetPackage = targetPackage;
        this.modules = new Map();
    }
    /**
     * Add modules to this project.
     * @param config Map of modules
     * @returns this project
     */
    setModules(config) {
        for (var m in config) {
            const module = new Module(m, this, config[m]);
            module.project = this;
            this.modules.set(module.name, module);
        }
        return this;
    }
}
exports.Project = Project;
