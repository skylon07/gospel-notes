import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import useClassName from "./useClassName.js"

function TestComponent(props) {
    try {
        const value = useClassName(props.options)
        if (typeof props.onUseClassName === "function") {
            props.onUseClassName(value)
        }
    } catch (error) {
        if (typeof props.onError === "function") {
            props.onError(error)
        } else {
            console.error("An error was thrown during render: " + error)
        }
    }
    return null
}

let root = null
beforeEach(() => {
    root = document.createElement("div")
    document.body.appendChild(root)
})
afterEach(() => {
    unmountComponentAtNode(root)
    document.body.removeChild(root)
    root = null
})

it("doesn't crash when no values are provided (tests component render)", () => {
    render(<TestComponent />, root)
})

it("can take and return a base class", () => {
    const base = "SomeBaseClass"
    const options = { base }
    let fullClass = null
    act(() => {
        render(<TestComponent
            options={options}
            onUseClassName={(str) => fullClass = str}
        />, root)
    })
    
    expect(fullClass).toBe(base)
})

describe("noMountingAnimation tests", () => {
    it("returns the .noMountingAnimation class", () => {
        const options = { noMountingAnimation: true }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
        
        expect(fullClass).toBe("noMountingAnimation")
    })
    
    it("does not return the .noMountingAnimation class on subsequent renders", () => {
        const options = { noMountingAnimation: true }
        act(() => {
            render(<TestComponent options={options} />, root)
        })
        
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
        
        expect(fullClass).not.toBe("noMountingAnimation")
        // in fact, let's be more generic...
        expect(fullClass.includes("noMountingAnimation")).toBe(false)
        
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
        
        expect(fullClass.includes("noMountingAnimation")).toBe(false)
    })
})

describe("choices list tests", () => {
    it("can return a class from a dictionary of choices", () => {
        const choice = {
            values: { good: "goodClass", bad: "badClass" },
            useKey: "bad",
        }
        const options = { choices: [choice] }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })

        expect(fullClass).toBe("badClass")
    })
    
    it("can return a class from a list of choices", () => {
        const choice = {
            values: ["class0", "class1", "class2"],
            useKey: 2,
        }
        const options = { choices: [choice] }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
        
        expect(fullClass).toBe("class2")
    })
})

describe("filters list tests", () => {
    it("returns the filtered item when given 'true'", () => {
        const filter = {
            value: "value",
            useIf: true,
        }
        const options = { filters: [filter] }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
        
        expect(fullClass).toBe("value")
    })
    
    it("returns a blank string when given 'false'", () => {
        const filter = {
            value: "value",
            useIf: false,
        }
        const options = { filters: [filter] }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
    
        expect(fullClass).toBe("")
    })
    
    it("returns the default item when given 'false'", () => {
        const filter = {
            value: "value",
            useIf: false,
            otherwise: "defaultClass",
        }
        const options = { filters: [filter] }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
    
        expect(fullClass).toBe("defaultClass")
    })
})

describe("class joining tests", () => {
    it("returns all classes separated by spaces", () => {
        const base = "SomeBase"
        const noMountingAnimation = true
        const choices = [{
            values: ["choice0", "choice1"],
            useKey: 1,
        }]
        const filters = [{
            value: "IamValue",
            useIf: true,
        }]
        const options = { base, noMountingAnimation, choices, filters }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
        
        expect(fullClass.includes("SomeBase")).toBe(true)
        expect(fullClass.includes("noMountingAnimation")).toBe(true)
        expect(fullClass.includes("choice1")).toBe(true)
        expect(fullClass.includes("IamValue")).toBe(true)
        expect(fullClass.split(' ').length).toBe(4)
    })
    
    it("does NOT strip already given spaces", () => {
        const base = "SomeBase with some space"
        const noMountingAnimation = true
        const choices = [{
            values: ["choice0 c0", "choice1 c1"],
            useKey: 0,
        }]
        const filters = [{
            value: "dang why even filter this",
            useIf: true,
        }]
        const options = { base, noMountingAnimation, choices, filters }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
        
        expect(fullClass.includes("SomeBase with some space")).toBe(true)
        expect(fullClass.includes("noMountingAnimation")).toBe(true)
        expect(fullClass.includes("choice0 c0")).toBe(true)
        expect(fullClass.includes("dang why even filter this")).toBe(true)
        expect(fullClass.split(' ').length).toBe(12)
    })
    
    it("ignores empty strings (ie does not join with spaces between them)", () => {
        const base = ""
        const noMountingAnimation = true
        const choices = [{
            values: ["", ""],
            useKey: 1,
        }]
        const filters = [{
            value: "not going to be used because...",
            useIf: false,
        }]
        const options = { base, noMountingAnimation, choices }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
        
        expect(fullClass.includes("noMountingAnimation")).toBe(true)
        expect(fullClass.split(' ').length).toBe(1)
        // which basically means...
        expect(fullClass).toBe("noMountingAnimation")
    })
})

function renderErrorTestWith(options) {
    let error = null
    act(() => {
        render(<TestComponent
            onError={(e) => error = e}
            options={options}
        />, root)
    })
    if (error) {
        throw error
    }
}
describe("a crap ton of throw-an-error tests", () => {
    describe("the 'options' themselves", () => {
        it("throws when an object is not given", () => {
            expect(() => {
                const options = null
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = 5
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = "an object but not really"
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        })
    })
    
    describe("option: base", () => {
        it("throws when a string is not given (and something else was)", () => {
            expect(() => {
                const options = { base: 3 }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            // these are VALID
            expect(() => {
                const options = {}
                renderErrorTestWith(options)
            }).not.toThrow()
            
            expect(() => {
                const options = { base: "" }
                renderErrorTestWith(options)
            }).not.toThrow()
        })
    })
    
    describe("option: noMountingAnimation", () => {
        it("throws when value can't be a boolean (oh wait... there isn't any)", () => {
            // thr problem is nothing...
            const theProblem = "nothing"
            expect("nothing").toBe(theProblem)
        })
        
        it("...basically never throws", () => {
            expect(() => {
                const options = { noMountingAnimation: null }
                renderErrorTestWith(options)
            }).not.toThrow()
            
            expect(() => {
                const options = { noMountingAnimation: 3 }
                renderErrorTestWith(options)
            }).not.toThrow()
            
            // yes... this should be considered truthy and not error
            expect(() => {
                const options = { noMountingAnimation: [] }
                renderErrorTestWith(options)
            }).not.toThrow()
        })
    })
    
    describe("option: choices", () => {
        it("throws when an array is not given (and something else was)", () => {
            expect(() => {
                const options = { choices: {} }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = { choices: 4 }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            // these are VALID
            expect(() => {
                const options = { choices: [] }
                renderErrorTestWith(options)
            }).not.toThrow()
            
            expect(() => {
                const options = {}
                renderErrorTestWith(options)
            }).not.toThrow()
        })
        
        it("throws when an invalid choice is given", () => {
            expect(() => {
                const options = { choices: [4, 3] }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = { choices: [null] }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    choices: [
                        "bad",
                        "choice",
                        "list",
                    ]
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        })
        
        it("throws when a bad choice-values list is given", () => {
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: null,
                            useKey: 0,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: { bad: "list" },
                            useKey: 0,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: { not: "gonna work" },
                            useKey: false,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            // these are VALID
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: { good: "", values: ""},
                            useKey: "good",
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).not.toThrow()
        })
        
        it("throws when the useKey is out-of-bounds of the choice-values list", () => {
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: ["val0", "val1"],
                            useKey: 2,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: ["val0", "val1"],
                            useKey: "bad key!",
                        }
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: { see: "how", im: "not", an: "array" },
                            useKey: 7,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        })
        
        it("throws when a non-string value is returned", () => {
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: [true],
                            useKey: 0,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: [55555],
                            useKey: 0,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: [null],
                            useKey: 0,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        })
    })
    
    describe("option: filters", () => {
        it("throws when an array is not given (and something else was)", () => {
            expect(() => {
                const options = { filters: {} }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = { filters: 12 }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            // these are VALID
            expect(() => {
                const options = { filters: [] }
                renderErrorTestWith(options)
            }).not.toThrow()
            
            expect(() => {
                const options = {}
                renderErrorTestWith(options)
            }).not.toThrow()
        })
        
        it("throws when an invalid filter is given", () => {
            expect(() => {
                const options = { filters: [9, 4] }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = { filters: [null] }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    filters: [
                        "bad",
                        "filter",
                        "list",
                    ]
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        })
        
        it("throws when a bad filter-value is given", () => {
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: null,
                            useIf: 0,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: { bad: "value" },
                            useIf: 0,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: 5678,
                            useIf: true,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        
            // these are VALID
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: "yes",
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).not.toThrow()
        })
        
        it("throws when a bad filter-otherwise is given", () => {
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: "yes",
                            otherwise: true,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: "ahuh",
                            otherwise: null,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: "yessir",
                            otherwise: ["lots", "of", "values?"],
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
            
            // these are VALID
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: "yup",
                            otherwise: "",
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).not.toThrow()
        })
    })
})
