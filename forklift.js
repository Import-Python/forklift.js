/*
  ______         _    _ _  __ _   
 |  ____|       | |  | (_)/ _| |  
 | |__ ___  _ __| | _| |_| |_| |_ 
 |  __/ _ \| '__| |/ / | |  _| __|
 | | | (_) | |  |   <| | | | | |_ 
 |_|  \___/|_|  |_|\_\_|_|_|  \__| 

    (c) 2017 Brendan Fuller                                                                    
*/
/**
 * Forklift.js - API System
*/
class ForkliftAPI {
    constructor() {
        this.cachedURL = {}
    }
    load(url, callback, cache = true) {
        let me = this
        if (this.isCached(url) && cache) {
            try {
                try {
                    let request = new XMLHttpRequest()
                    request.onreadystatechange =
                        function ready() {
                            if (request.readyState < 4) {
                                return null
                            }
                            if (request.status !== 200) {
                                return null
                            }
                            if (request.readyState === 4) {
                                me.setCached(url, request)
                                callback(request)

                            }
                        }
                    request.open('GET', url, true)
                    request.send('')
                } catch (e) {
                    return false
                }
            } catch (e) {
                return false
            }
            return true
        } else {
            callback(this.cachedURL[url])
            return true
        }
    }
    isCached(url) {
        if (this.cachedURL[url] == undefined) {
            return true
        }
        return false
    }
    setCached(url, data) {
        if (this.cachedURL[url] == undefined) {
            this.cachedURL[url] = data
        }
    }
    log(message, css = null) {
        setTimeout(console.log.bind(console, message, css), 0);
    }
    warn(message, css = null) {
        setTimeout(console.warn.bind(console, message, css), 0);
    }
    error(message, css = null) {
        setTimeout(console.error.bind(console, message, css), 0);
    }
    timeEnd(id) {
        setTimeout(console.timeEnd(id), 0)
    }
}
/**
 * PaletteHandler - Handles all created Palettes & Units
 */
class UnitHandler {
    constructor(parent, paletteID) {
        this.parent = parent
        this.paletteID = paletteID
        this.units = {}
    }
    addUnit(unitID, instance) {
        if (!this.isUnit(unitID)) {
            this.units[unitID] = {}
            this.units[unitID].Class = instance
        }
    }
    getUnit(unitID) {
        if (this.isUnit()) {
            return this.units[unitID]
        }
    }
    getUnits() {
        return this.units
    }
    isUnit(unitID) {
        if (this.units[unitID] != undefined) {
            return true
        }
        return false
    }
}
/**
 * BoxHander - Handles all created BOXES per PALETTE which can be then manipulated by UNITS 
 */
class BoxHandler {
    /**
     * @param {*} parent - The PALETTE instance
     * @param {*} pid - The PALETTE id 
     */
    constructor(parent, pid) {
        this.parent = parent
        this.pid = pid
        this.totalBoxes = 0
        this.boxes = {}
    }
    addBox(object, name) {
        this.totalBoxes = this.totalBoxes + 1
        this.boxes[this.totalBoxes] = {}
        this.boxes[this.totalBoxes].Object = object
        this.boxes[this.totalBoxes].Name = name
        this.boxes[this.totalBoxes].boxLoaded = false
        this.boxes[this.totalBoxes].contentLoaded = false
        return this.totalBoxes
    }
    boxLoaded(id) {
        this.boxes[id].boxLoaded = true
        this.parent._checkBoxes()
    }
    contentLoaded(id) {
        this.boxes[id].contentLoaded = true
        this.parent._checkBoxes()
    }
    getBoxes() {
        return this.boxes
    }
    _isLoaded() {
        for (let box in this.boxes) {
            if (!this.boxes[box].contentLoaded) {
                return false
            }
            else if (!this.boxes[box].boxLoaded) {
                return false
            } else {
                //console.log("BOX: " + this.boxes[box].Name + " | PID: " + this.pid)
            }
        }
        if (this.totalBoxes > 0) {
            return true
        }
        return true
    }
}
class ForkliftHandler {
    constructor() {
        this.palettes = {}
        this.loaded = false
        this.units = {}
    }
    newPalette(paletteID, file) {
        // Check if palette name is already used or not
        if (this.palettes[paletteID] == null || this.palettes[paletteID] == undefined) {
            // Create a dictonary for the id then
            this.palettes[paletteID] = {}
            this.palettes[paletteID].BoxHandler = new BoxHandler(this, paletteID)
            this.palettes[paletteID].UnitHandler = new UnitHandler(this, paletteID)
            this.palettes[paletteID].File = file
        } else {
            try {
                throw new Error("Project name already used!")
            } catch (e) {
                let file = e.stack.split("\n")[(e.stack.split("\n").length - 1)].split("at ").pop().slice(0, -1)
                forklift.API.error(`[forklift.js] %c ${e.message} in '${file}'`)
            }
        }
    }
    /**
     * 
     * @param {*} palettes 
     * @param {*} unitID 
     * @param {*} file 
     */
    newUnit(palettes, unitID, file) {
        if (this.units[unitID] == null) {
            this.units[unitID] = {}
            palettes = palettes.split("|")
            this.units[unitID].File = file
            this.units[unitID].Palettes = palettes
        }
    }
    /**
     * 
     * @param {*} paletteID 
     */
    getUnitHandler(paletteID) {
        if (this.palettes[paletteID] != null) {
            return this.palettes[paletteID].UnitHandler
        }
    }
    /**
     * 
     * @param {*} paletteID 
     */
    getBoxHandler(paletteID) {
        if (this.palettes[paletteID] != null) {
            return this.palettes[paletteID].BoxHandler
        }
    }
    getPalette(paletteID) {
        if (this.palettes[paletteID] != null) {
            return this.palettes[paletteID]
        }
        return null
    }
    getUnit(unitID) {
        if (this.units[unitID] != null) {
            return this.units[unitID]
        }
        return null
    }
    getFile(paletteID) {
        if (this.palettes[paletteID] != null) {
            return this.palettes[paletteID].File
        }
    }
    isPalette(paletteID) {
        if (this.palettes[paletteID].Palette != undefined) {
            return true
        }
        return false
    }
    _loadPalettes() {
        this.start = performance.now()
        for (let palette in this.palettes) {
            try {
                this.palettes[palette].Palette = require(`./${this.palettes[palette].File}`)
                try {
                    let difference = (performance.now() - this.start).toFixed(2)
                    forklift.API.log(`[forklift.js] %cLoading Palette: ${palette} | ${difference}ms`, 'color: orange;')
                    this.palettes[palette].Class = new this.palettes[palette].Palette(palette)
                } catch (e) {
                    forklift.API.warn(`[forklift.js] %cCould not load: ${palette}`, 'color: purple')
                    let file = e.stack.split("\n")[1].split("(").pop().slice(0, -1)
                    forklift.API.error(`[forklift.js] %c'${e.message}' in '${file}'`)
                    if (e) throw e;   
                }
            } catch (e) {
                let file = e.stack.split("\n")[0].split("Error: Cannot find module '").pop().slice(0, -1)
                forklift.API.error(`[forklift.js] %cCannot find '${file}'`)
                if (e) throw e;   
            }
        }
        let difference = (performance.now() - this.start).toFixed(2)
        forklift.API.log(`[forklift.js] %cPalette(s) Loaded | ${difference}ms`, 'color: orange')
        forklift.API.log(`[forklift.js] %cLoading Boxes... | ${difference}ms`, 'color: green')
    }
    _loadUnits() {
        let me = this
        for (let unit in this.units) {
            try {
                this.units[unit].Unit = require(`./${this.units[unit].File}`)
                try {
                    let end = performance.now()
                    let difference = (end - this.start).toFixed(2)
                    forklift.API.log(`[forklift.js] %cLoaded Unit: ${unit} | ${difference}ms`, 'color: #ff69b4;')
                    let data = {}
                    data.p = this.paletteID
                    data.u = unit
                    data.f = this.units[unit].File
                    this.units[unit].Class = new this.units[unit].Unit(data)
                } catch (e) {
                    forklift.API.warn(`[forklift.js] %cCould not load Unit: ${unit}`, 'color: purple')
                    let file = e.stack.split("\n")[1].split("(").pop().slice(0, -1)
                    forklift.API.error(`[forklift.js] %c'${e.message}' in '${file}'`)
                    if (e) throw e;   
                }
            } catch (e) {
                let file = e.stack.split("\n")[0].split("Error: Cannot find module '").pop().slice(0, -1)
                forklift.API.error(`[forklift.js] %cCannot find '${file}'`)

                if (e) throw e;   
            }
            let allPalette = ""
            let loop = 0
            for (let palette in this.units[unit].Palettes) {
                if (this.palettes[this.units[unit].Palettes[palette]] != null) {
                    this.getUnitHandler(this.units[unit].Palettes[palette]).addUnit(unit, this.units[unit].Class)
                    if (loop < 1) {
                        allPalette = allPalette + this.units[unit].Palettes[palette]
                    } else {
                        allPalette = allPalette + ", " + this.units[unit].Palettes[palette]
                    }
                    loop = loop + 1
                }
            }
            let difference = (performance.now() - this.start).toFixed(2)
            forklift.API.log(`[forklift.js] %c${unit} hooked on palette: [${allPalette}] | ${difference}ms`, 'color: #54b2a9;')
        }
        if (Object.keys(this.units) == 0) {
            let difference = (performance.now() - this.start).toFixed(2)
            forklift.API.log(`[forklift.js] %cNo Units found! | ${difference}ms`, 'color: blue')
        }
        for (let palette in this.palettes) {
            let boxHandler = this.getBoxHandler(palette)
            let boxes = boxHandler.getBoxes()
            for (let box in boxes) {
                setTimeout(() => {
                    boxes[box].Object.onUnitLoad(me.start)
                }, 50)
            }
            this.palettes[palette].Class.onUnitLoad()
        }
    }
    _checkBoxes() {
        let me = this
        let loaded = true
        for (let palette in this.palettes) {
            let box = this.getBoxHandler(palette)
            if (!box._isLoaded()) {
                loaded = false
            }
        }
        if (loaded && this.loaded == false) {
            this.loaded = true
            let end = performance.now()
            let difference = (end - this.start).toFixed(2)
            forklift.API.log(`[forklift.js] %cBoxes Loaded | ${difference}ms`, 'color: green')
            forklift.API.log(`[forklift.js] %cLoading Units... | ${difference}ms`, 'color: blue')

            setTimeout(() => {
                me._loadUnits()
            }, 0)
        }
    }

}
/**
 * Extends of new Palette Created
 */
class PaletteLoader {
    constructor(id) {
        this.id = id
        this.file = forklift.Handlers.getFile(id)
        this.units = forklift.Handlers.getUnitHandler(id).getUnits()
        this.elements = {}
    }
    /**
     * Adds a Box (aka Custom HTML Element) that allows for the content to be created 
     *  - Shadow Root
     *  - Content Slot
     * @param {Name of box} name 
     * @param {Element tag} element -
     * @param {Class intance} htmlObject 
     */
    addBox(name, element, htmlObject) {
        if (!this._isBox(name)) {
            this.elements[name] = {}
            this.elements[name].ElementTag = element
            var data = {}
            data.file = this.file
            data.name = name
            data.id = this.id
            let proto = Object.create(HTMLElement.prototype, {
                createdCallback: {
                    value: function () {
                        this.shadow = this.attachShadow({ mode: "closed" });
                        data.element = this
                        this.object = new htmlObject(data)
                    }
                },
                attributeChangedCallback: {
                    value: function (name, oldValue, newValue) {
                        this.object.onAttributeChange(name, oldValue, newValue)
                    }
                }
            });
            document.registerElement(element, { prototype: proto });
        } else {
            forklift.API.log(`[forklift.js] %c'${name}' element already used in '${this.file}'`, 'color: red')
        }
    }
    /**
     * Gets a ElementTag by its name
     * @param {Name of Tag} name 
     */
    getElementTag(name) {
        if (this._isBox(name)) {
            return this.elements[name].ElementTag
        } else {
            return null
        }
    }
    /**
     * Query's a Box (custom HTML Element, if only one is specified)
     * @param {Name of Box} name 
     */
    getBox(name) {
        //TODO: Add a callback if make sure that if more than one element of the same name is being used, have an error occur.
        if (this._isBox(name)) {
            return document.querySelector(this.elements[name].ElementTag)
        }
    }
    /**
     * Gets Box Instane
     * @param {Name of Box} name 
     */
    getBoxObject(name) {
        if (this._isBox(name)) {
            return document.querySelector(this.elements[name].ElementTag).object
        }
    }
    _isBox(name) {
        if (this.elements[name] != null) return true
        return false
    }
    onUnitLoad() {}
}
/**
* PaletteBox - a BOX extender class for use with a PALETTELOADER
*/
class PaletteBox {
    /**
     * @param {Palette Data Array} data 
     */
    constructor(data) {
        this.element = data.element
        this.file = data.file
        this.pid = data.id
        this.name = data.name
        this.filePath = this.file.split(this.file.substring(this.file.lastIndexOf("/") + 1))[0]
        this.shadow = this.element.shadow
        this.bid = forklift.Handlers.getBoxHandler(this.pid).addBox(this, this.name)
    }
    /**
     * loadBox - Loads HTML into the BOX shadow document
     * @param {HTML File} file 
     */
    loadBox(file) {
        if (file == null) {
            forklift.Handlers.getBoxHandler(this.pid).boxLoaded(this.bid)
        } else {
            let me = this
            let html = ""
            let feedback = forklift.API.load((me.filePath + file), (data) => {
                if (data != null) {
                    html = data.responseText
                    html = html.split("<template>")[1].split("</template>")[0]
                    this.element.shadow.innerHTML = html
                } else {
                    forklift.API.log(`[forklift.js] %cCannot load '${file}'`, 'color: red')
                }
                this.onBoxLoad()
            })
            if (!feedback) {
                forklift.API.log(`[forklift.js] %cCannot find box '${file}'`, 'color: red')
            }
            forklift.Handlers.getBoxHandler(this.pid).boxLoaded(this.bid)
        }
    }
    /**
     * loadContent - Loads HTML file directly into the TAG
     * @param {HTML File} file 
     */
    loadContent(file) {
        if (file == null) {
            forklift.Handlers.getBoxHandler(this.pid).contentLoaded(this.bid)
        } else {
            let me = this
            let html = ""
            let feedback = forklift.API.load((me.filePath + file), (data) => {
                if (data != null) {
                    html = data.responseText
                    html = html.split("<template>")[1].split("</template>")[0]
                    this.element.innerHTML = html
                } else {
                    forklift.API.log(`[forklift.js] %cCannot load '${file}'`, 'color: red')
                }
                this.onContentLoad()
            })
            if (!feedback) {
                forklift.API.log(`[forklift.js] %cCannot find content '${file}'`, 'color: red')
            }
            forklift.Handlers.getBoxHandler(this.pid).contentLoaded(this.bid)
        }
    }
    querySelect(object) {
        try {
            return this.shadow.querySelector(object)
        } catch (e) {
            let file = e.stack.split("\n")[2].split("(").pop().slice(0, -1)
            forklift.API.log(`[forklift.js] %c'${e.message}' \n'${file}'`, 'color: red')
        }
    }
    setAttribute(attr, name) {
        try {
            return this.element.setAttribute(attr, name)
        } catch (e) {
            let file = e.stack.split("\n")[2].split("(").pop().slice(0, -1)
            forklift.API.log(`[forklift.js] %c'${e.message}' \n'${file}'`, 'color: red')
        }
    }
    getAttribute(attr) {
        try {
            return this.element.getAttribute(attr)
        } catch (e) {
            let file = e.stack.split("\n")[2].split("(").pop().slice(0, -1)
            forklift.API.log(`[forklift.js] %c'${e.message}' \n'${file}'`, 'color: red')
        }
    }
    callEvent(object, args = null, output = false, unitID = null, type = null) {
        let handler = forklift.Handlers.getUnitHandler(this.pid)
        let units = handler.getUnits()
        let pass = false
        if (unitID == null) {
            for (let unit in units) {
                pass = false
                try {
                    //Check type of UNIT? (if true)
                    if (type != null) {
                        //Get type of unit is defined (default to "NONE")
                        if (units[unit].Class._getType() == type) {
                            //IF type is same time as given, let it pass and run event
                            pass = true 
                        } //else, don't do anything cause pass is already set to false
                    } else {
                        //If there is not type (which is most likely going to happen), just continue with the if statement
                        pass = true
                    }
                    if (pass) {
                        console.log(unit)
                        units[unit].Class[`${object}`].apply(units[unit].Class._getThis(), args)

                    }
                } catch (e) {
                    //let file = e.stack.split("\n")[(1)].split("at ").pop().slice(0, -1)
                    //forklift.API.error(`[forklift.js] %c ${e.message} in '${file}'`)   
                    //console.log(e)            
                }
            }
        } else {
            let check = false
            for (let unit in units) {
                if (unitID == unit) {
                    check = true
                }
            }
            if (check) {
                let unit = unitID
                if (output) {
                    return units[unit].Class[`${object}`].apply(units[unit].Class._getThis(), args)
                } else {
                    units[unit].Class[`${object}`].apply(units[unit].Class._getThis(), args)
                }
            }
        }
    }
    onAttributeChange(name, oldValue, newValue) { }
    onBoxLoad() { }
    onContentLoad() { }
    onUnitLoad() { }
}
/**
 * UNIT Handler Class
 * - When a UNIT is created it will extend this class.
 * - This class allows for hooking to other methods
 * - 
 */
class Unit {
    /**
     * @param {ID of UNIT} d.u
     * @param {File of UNIT} d.f
     */
    constructor(d) {
        this.id = d.u
        this.file = d.f
        this.filePath = this.filePath = this.file.split(this.file.substring(this.file.lastIndexOf("/") + 1))[0]
        this.type = "NONE"
        this.hookedUnits = {}
    }
    /**
     * getDirectory - Gets file path 
     */
    getDirectory() {
        return this.filePath
    }
    //TODO: Finished UnitHook
    unitHook(unitID) {
        forklift.Handlers.getUnit(unitID).Class.onUnitBind(this.id)
    }
    /**
     * setType - Sets the type of unit defined by the forklift project
     * @param {Unit Type} type 
     */
    setType(type) {
        this.type = type
    }
    //TODO: Also finish bind event ()
    onUnitBind(unitID) {
        if (this.hookedUnits[unitID] == null) {
            this.hookedUnits[unitID] = unitID
        }
    }
    callEvent(object, args = null, output = false) {
        for (let unit in this.hookedUnits) {
            try {
                forklift.Handlers.getUnit(unit).Class[`${this.id}_${object}`].apply(forklift.Handlers.getUnit(unit).Class._getThis(), args)
            } catch (e) {
                //error would occur
            }
        }
    }
    /**-----------------------------------------------------------------**/
    /**
     * _getThis - Gets this?
     */
    _getThis() {
        return this
    }
    _getType() {
        return this.type
    }
    _addUnit(unitID) {

    }
}


class ForkliftApp {
    constructor() { }
    run() {
        forklift.Handlers._loadPalettes()
    }
    loadPalette(paletteID, file) {
        forklift.Handlers.newPalette(paletteID, file)
    }
    loadUnit(palettes, unitID, file) {
        forklift.Handlers.newUnit(palettes, unitID, file)
    }
    getPalette(paletteID) {
        return forklift.Handlers.getPalette(paletteID)
    }
    getPaletteInstance(paletteID) {
        return forklift.Handlers.getPalette(paletteID).Class
    }
    getUnit(unitID) {
        return forklift.Handlers.getUnit(unitID)
    }
    getUnitInstance(unitID) {
        return forklift.Handlers.getUnit(unitID).Class
    }
    /* -------- Private Functions --------- */
    _loadTemplate(location) {
        API.load()
    }
    _statistics() {

    }
}

const forklift = {}

forklift.API = new ForkliftAPI()
forklift.Handlers = new ForkliftHandler()
forklift.App = new ForkliftApp()


forklift.Unit = Unit
forklift.PaletteLoader = PaletteLoader
forklift.PaletteBox = PaletteBox

const fl = forklift
/* END OF forklift.js */