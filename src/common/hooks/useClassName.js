import { useMountedState } from './'
import "./useClassName.css"

const ERROR = {
    internal(str) {
        throw new Error(`Internal useClassName() error: ${str}`)
    },
    typeError(str) {
        throw new TypeError(`Custom hook useClassName() failed to process; ${str}`)
    },
}

const WARN = {
    extraOption(str) {
        console.warn(`Custom hook useClassName() got an extra option "${str}"; Did you mean to do this?`)
    },
}

// NOTE: this deals with CSS classes, not JS classes
// options objects have these parameters:
//      base - a string representing the component name or base class
//      noMountingAnimation - a boolean telling useClassName() to return
//          "noMountingAnimation" on the initial render
//      choices - an array of { values, useKey } objects to pick from/branch
//          multiple CSS classes
//      filters - an array of { value, useIf, otherwise="" } objects to filter
//          values from (and possibly give defaults)
function useClassName(options={}) {
    const mounted = useMountedState()
    const trackers = {
        base: createValidationTracker("base"),
        noMountingAnimation: createValidationTracker("noMountingAnimation"),
        choices: createValidationTracker("choices"),
        filters: createValidationTracker("filters"),
        ignoreWarnings: createValidationTracker("ignoreWarnings"),
    }
    const state = { mounted, trackers }
    
    Processor.processOptions(options, state)
    
    const fullClassString = joinValidatedStrings(trackers)
    return fullClassString
}
export default useClassName

function createValidationTracker(optionName) {
    let classString = null
    const isValidated = () => typeof classString === "string"
    const tracker = {
        validate: (value) => {
            if (isValidated()) {
                ERROR.internal(`Tracker for "${optionName} was revalidated`)
            }
            if (typeof value !== "string") {
                ERROR.internal(`Processor tried to validate "${optionName}" with an invalid non-string value: ${value}`)
            }
            classString = value
        },
        get isValidated() {
            return isValidated()
        },
        get classString() {
            return classString
        },
    }
    return tracker
}

function joinValidatedStrings(trackerDict) {
    let joinedStrings = ""
    for (const trackerName in trackerDict) {
        const tracker = trackerDict[trackerName]
        if (!tracker.isValidated) {
            // NOTE: this is an error because it also means a classString was
            //       never given (and therefore breaks the joining process)
            ERROR.internal(`Option "${trackerName} was never marked as validated`)
        }
        
        joinedStrings = combineClassStrings(joinedStrings, tracker.classString)
    }
    return joinedStrings
}

function combineClassStrings(classString, newClass) {
    if (classString === "") {
        return newClass
    } else if (newClass === "") {
        return classString
    } else {
        return classString + " " + newClass
    }
}

// distributes processing into different phases
// NOTE: this module should NOT THROW ERRORS (directly, at least)
class Processor {
    static processOptions(options, state) {
        Validator.validateOptions(options, state)
        this.processIgnoreWarnings(options, state)
        
        this.processBase(options, state)
        this.processNoMountingAnimation(options, state)
        this.processChoices(options, state)
        this.processFilters(options, state)
    }
    
    static processIgnoreWarnings(options, state) {
        // this is valid, pretty much no matter what
        state.trackers.ignoreWarnings.validate("")
    }
    
    static processBase(options, state) {
        const option = options.base
        const tracker = state.trackers.base
        
        const errorMessage = `Option 'base' must be a string, not '${option}'`
        Validator.type("string").ensureIsValid(errorMessage, option)
        
        tracker.validate(option || "")
    }
    
    static processNoMountingAnimation(options, state) {
        const option = options.noMountingAnimation
        const tracker = state.trackers.noMountingAnimation
        
        const shouldUseClass = option && !state.mounted
        const noAnimClass = shouldUseClass ? "noMountingAnimation" : ""
        
        tracker.validate(noAnimClass)
    }
    
    static processChoices(options, state) {
        const option = options.choices
        const tracker = state.trackers.choices
        
        const optionError = `Option 'choices' must be an object, not '${option}'`
        Validator.type(Array).ensureIsValid(optionError, option)
        if (!option) {
            tracker.validate("")
            return
        }
        
        const choiceType = Validator.type({
            values: "object",
            useKey: "any",
        })
        const chosenClassType = Validator.type("string", true)
        const choiceStrings = option.reduce((lastResult, choice) => {
            const choiceError = `Option 'choices' must have a values property (object) and a useKey property (any)`
            choiceType.ensureIsValid(choiceError, choice)
            
            const chosenClass = choice.values[choice.useKey]
            const chosenClassError = `Returned choice class was not a string: ${chosenClass}`
            chosenClassType.ensureIsValid(chosenClassError, chosenClass)
            
            return combineClassStrings(lastResult, chosenClass)
        }, "")
        
        tracker.validate(choiceStrings)
    }
    
    static processFilters(options, state) {
        const option = options.filters
        const tracker = state.trackers.filters
        
        const optionError = `Option 'filters' must be an object, not '${option}'`
        Validator.type(Array).ensureIsValid(optionError, option)
        if (!option) {
            tracker.validate("")
            return
        }
        
        const filterType = Validator.type({
            value: "string",
            useIf: "any",
            // can also have "otherwise" property, but not required
        })
        const otherwiseType = Validator.type("string")
        const filterStrings = option.reduce((lastResult, filter) => {
            const filterError = `Option 'filters' must have a value property (string) and a useIf property (any)`
            filterType.ensureIsValid(filterError, filter)
            
            const otherwiseError = `Option 'filters' can only receive a string for the otherwise property, not '${filter.otherwise}'`
            otherwiseType.ensureIsValid(otherwiseError, filter.otherwise)
            
            const defaultValue = filter.otherwise || ""
            const filteredClass = filter.useIf ? filter.value : defaultValue
            
            return combineClassStrings(lastResult, filteredClass)
        }, "")
        
        tracker.validate(filterStrings)
    }
}

// has nothing but helpful type checking functions
// NOTE: all error throwing should be done here (and through the ERROR object)
class Validator {
    static validateOptions(options, state) {
        if (typeof options !== "object" || options === null) {
            ERROR.typeError(`Got a bad options value: ${options}`)
        }
        
        // the rest just displays warnings; skip it if warnings are ignored
        if (!options.ignoreWarnings) {
            const validOptions = state.trackers
            for (const optionName in options) {
                if (!validOptions[optionName]) {
                    WARN.extraOption(optionName)
                }
            }
        }
    }
    
    // creates a "type object" that can test against values
    static type(type, mustExist=false) {
        const isValid = (value, strict=false) => this.checkType(type, value, mustExist, strict)
        const ensureIsValid = (errorMessage, ...args) => {
            if (!isValid(...args)) {
                ERROR.typeError(errorMessage)
            }
        }
        return { isValid, ensureIsValid }
    }
    
    static checkType(type, value, mustExist=false, strict=false) {
        // NOTE: undefined is valid by default, unless you pass "mustExist"
        if (value === undefined) {
            return !mustExist
        }
        
        switch (typeof type) {
            case "string":
                if (type === "any") {
                    return true
                } else {
                    return typeof value === type
                }
            
            case "function":
                return value instanceof type
            
            case "object":
                if (type !== null) {
                    return Validator.objectHasShape(value, type, strict)
                }
                // null is treated as invalid type
            default:
                ERROR.internal(`Validator was given an invalid type to test against: '${type}'`)
        }
    }
    
    static objectHasShape(object, shape, strict=false) {
        if (typeof shape !== "object" || shape === null) {
            // NOTE: useClassName() internally is the only one to define shapes
            ERROR.internal(`Invalid shape to compare with: ${shape}`)
        }
        if (typeof object !== "object") {
            ERROR.typeError(`Cannot check shape of a non-object: ${object}`)
        }
        if (object === null) {
            return false
        }
        
        for (const key in shape) {
            const shapeType = shape[key]
            const prop = object[key]
            if (!this.checkType(shapeType, prop, true, strict)) {
                return false
            }
        }
        if (strict) {
            for (const key in object) {
                const shapeType = shape[key]
                if (shapeType === undefined) {
                    return false
                }
            }
        }
        return true
    }
}
