import { useRef } from "react"
import { useMountedState } from './'
import "./useClassName.css"

// NOTE: this deals with CSS classes, not JS classes
// options objects have these parameters:
//      base - a string representing the component name or base class
//      noMountingAnimation - a boolean telling useClassName() to return
//          "noMountingAnimation" on the initial render
//      choices - an array of { values, selection } objects to pick from/branch
//          multiple CSS classes (if "selection" is a boolean, it will be mapped
//          to an index of 0 or 1)
function useClassName(options={}) {
    options = Validator.validateOptions(options)
    
    const mounted = useMountedState()
    const state = { mounted }
    
    // the base class to always use
    const baseClass = processBaseClass(options, state)
    
    // prevents animations on initial render
    const noMountingAnimation = processNoMountingAnimation(options, state)
    
    // selects a class from each list of classes
    const choiceClasses = processChoiceClasses(options, state)
    
    // filters classes by boolean values
    // const filterClasses = processFilterClasses(options)
    
    const fullClassString = joinClassStrings(baseClass, noMountingAnimation, choiceClasses)
    return fullClassString
}
export default useClassName

function joinClassStrings(...strs) {
    const joined = strs.reduce((accStr, currStr) => {
        if (typeof currStr !== "string") {
            throw new TypeError(`Custom hook uuseClassName had an internal error: Argument given to join() is not a string (are all processing functions returning strings?)`)
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
    if (!options.choices) {
        return ""
    }
    
    const allChosenClasses = options.choices.reduce((accStr, choice) => {
        if (!choice || typeof choice !== "object") {
            throw new TypeError(`Custom hook useClassName received an invalid, non-object choice: ${choice}`)
        }
        
        const { values, selection } = choice
        if (!values || typeof values !== "object") {
            throw new TypeError(`Custom hook useClassName received an invalid values object inside a choice: ${values}`)
        }
        let selectionKey
        switch (typeof selection) {
            case "string":
                selectionKey = selection
                break
            
            case "number":
                selectionKey = selection + ""
                break
            
            default:
            case "boolean":
                selectionKey = selection ? '1' : '0'
        }
        
        let chosenClass = values[selectionKey]
        if (chosenClass === undefined) {
            throw new TypeError(`Custom hook useClassName received a choice-selection that did not reside in the given choice-values object: ${selectionKey}`)
        }
        if (!chosenClass) {
            chosenClass = ""
        }
        if (typeof chosenClass !== "string") {
            throw new TypeError(`Custom hook useClassName received a selected choice that was not a string: ${chosenClass}`)
        }
        if (accStr !== "") {
            accStr += " "
        }
        accStr += chosenClass
        return accStr
    }, "")
    return allChosenClasses
}

// ALL ABOUT standardizing arguments and validating them
class Validator {
    static validateOptions(options) {
        if (!options || typeof options !== "object") {
            throw new TypeError(`Custom hook useClassName received an invalid options argument: ${options}`)
        }
        
        if (options.base && typeof options.base !== "string") {
            throw new TypeError(`Custom hook useClassName received an invalid, non-string base class: ${options.base}`)
        }
        
        if (options.choices !== undefined && !Array.isArray(options.choices)) {
            throw new TypeError(`Custom hook useClassName received an invalid choices array: ${options.choices}`)
        }
        
        return options
    }
}
