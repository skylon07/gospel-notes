import { useRef } from "react"
import { useMountedState } from './'

// NOTE: this deals with CSS classes, not JS classes
// options objects have these parameters:
//      base - a string representing the component name or base class
//      noMountingAnimation - a boolean telling useClass() to return
//          "noMountingAnimation" on the initial render
//      choices - an array of { values, selection } objects to pick from/branch
//          multiple CSS classes (if "selection" is a boolean, it will be mapped
//          to an index of 0 or 1)
//      choiceValues, choiceSelections - alternative interface for "choices",
//          which can process both lists of values as well as single values
function useClass(options={}) {
    validateArgs(options)
    preprocessOptions(options)
    
    const mounted = useMountedState()
    const state = { mounted }
    
    // the base class to always use
    const baseClass = processBaseClass(options, state)
    
    // prevents animations on initial render
    const noMountingAnimation = processNoMountingAnimation(options, state)
    
    // selects a class from each list of classes
    const choiceClasses = processChoiceClasses(options, state)
    
    const fullClassString = joinClassStrings(baseClass, noMountingAnimation, choiceClasses)
    return fullClassString
}
export default useClass

function validateArgs(options) {
    if (!options || typeof options !== "object") {
        throw new TypeError(`Custom hook useClass received an invalid options argument: ${options}`)
    }
    
    if (options.base && typeof options.base !== "string") {
        throw new TypeError(`Custom hook useClass received an invalid, non-string base class: ${options.base}`)
    }
    
    //  NOTE: empty arrays are considered 2D
    const choiceValuesIs2DArray = Array.isArray(options.choiceValues) && (
        Array.isArray(options.choiceValues[0]) ||
        options.choiceValues.length === 0
    )
    // NOTE: this is the measurement of how many choices there will be after
    //       being parsed (non-arrays are turned into arrays with one element)
    const choiceValuesCount = choiceValuesIs2DArray ?
        options.choiceValues.length : options.choiceValues ?
        1 : null
    const choiceSelectionsCount = Array.isArray(options.choiceSelections) ?
        options.choiceSelections.length : options.choiceSelections !== undefined ?
        1 : null
    if (choiceValuesCount !== choiceSelectionsCount) {
        throw new TypeError(`Custom hook useClass received choiceValues/choiceSelections of differing lengths`)
    }
    
    if (options.choices && !Array.isArray(options.choices)) {
        throw new TypeError(`Custom hook useClass received an invalid value for the choices array: ${options.choices}`)
    }
}

// consolidates some syntaxes to make processing easier
function preprocessOptions(options) {
    _combineChoices(options)
}
// helper preprocessor functions
function ensureArray(value) {
    if (!value) {
        return []
    }
    if (!Array.isArray(value)) {
        return [value]
    }
    return value
}
function _combineChoices(options) {
    if (!options.choices) {
        options.choices = []
    }
    options.choiceValues = ensureArray(options.choiceValues)
    options.choiceSelections = ensureArray(options.choiceSelections)
    // ensures choiceValues is a 2D array (in case a 1D array was provided as
    // the only set of values)
    const hasOneOrMoreValues = options.choiceValues.length > 0
    if (hasOneOrMoreValues && !Array.isArray(options.choiceValues[0])) {
        options.choiceValues = [options.choiceValues]
    }
    
    for (let i = 0; i < options.choiceValues.length; i++) {
        const values = options.choiceValues[i]
        if (!Array.isArray(values)) {
            throw new TypeError(`Custom hook useClass received an invalid choiceValue: ${values}`)
        }
        const selection = options.choiceSelections[i]
        
        const choice = { values, selection }
        options.choices.push(choice)
    }
}

function joinClassStrings(...strs) {
    const joined = strs.reduce((accStr, currStr) => {
        if (typeof currStr !== "string") {
            throw new TypeError(`Custom hook useClass had an internal error: Argument given to join() is not a string (are all processing functions returning strings?)`)
        }
        if (currStr !== "") {
            if (accStr !== "") {
                accStr += ' '
            }
            accStr += currStr
        }
        return accStr
    })
    return joined
}

// NOTE: all process functions are given the entire options and state, and MUST
//       ALWAYS return a string (even if it is empty)
function processBaseClass(options, state) {
    return options.base || ""
}

function processNoMountingAnimation(options, state) {
    if (options.noMountingAnimation && !state.mounted) {
        return "noMountingAnimation"
    }
    return ""
}

function processChoiceClasses(options, state) {
    // NOTE: options.choices was guaranteed tonbe an array during preprocessing
    const allChosenClasses = options.choices.reduce((accStr, choice) => {
        if (!choice || typeof choice !== "object") {
            throw new TypeError(`Custom hook useClass received an invalid, non-object choice: ${choice}`)
        }
        
        const { values, selection } = choice
        if (!values || !Array.isArray(values)) {
            throw new TypeError(`Custom hook useClass received an invalid value list inside a choice: ${values}`)
        }
        let selectionIdx = selection
        if (typeof selection !== "number") {
            // this converts boolean/truthy selections for 2-choice value arrays
            selectionIdx = values.length === 1 ? 
                (selection ? 0 : null) : (selection ? 1 : 0)
        }
        
        if (selectionIdx !== null && (selectionIdx < 0 || selectionIdx >= values.length)) {
            throw new TypeError(`Custom hook useClass received a selection number (${selectionIdx}) that is outside the bounds of the choice list (0..${values.length})`)
        }
        
        const chosenClass = values[selectionIdx] || ""
        if (typeof chosenClass !== "string") {
            throw new TypeError(`Custom hook useClass received a choice value list that did not contain strings`)
        }
        if (accStr !== "") {
            accStr += " "
        }
        accStr += chosenClass
        return accStr
    }, "")
    return allChosenClasses
}
