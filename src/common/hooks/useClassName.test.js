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
    it("can choose given a key", () => {
        let choice = {
            values: ["class0", "class1", "class2"],
            selection: 2,
        }
        let options = { choices: [choice] }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })

        expect(fullClass).toBe("class2")

        choice = {
            values: { good: "goodClass", bad: "badClass" },
            selection: "bad",
        }
        options = { choices: [choice] }
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })

        expect(fullClass).toBe("badClass")
    })

    it("can choose given a boolean (converting to an integer index)", () => {
        let choice = {
            values: ["class0", "class1", "class2"],
            selection: false,
        }
        let options = { choices: [choice] }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })

        expect(fullClass).toBe("class0")

        choice = {
            values: ["class0", "class1", "class2"],
            selection: true,
        }
        options = { choices: [choice] }
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })

        expect(fullClass).toBe("class1")
    })
})

describe("class joining tests", () => {
    it("returns all classes separated by space", () => {
        const base = "SomeBase"
        const noMountingAnimation = true
        const choices = [{
            values: ["choice0", "choice1"],
            selection: true,
        }]
        const options = { base, noMountingAnimation, choices }
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
        expect(fullClass.split(' ').length).toBe(3)
    })
    
    it("does NOT strip already given spaces", () => {
        const base = "SomeBase with some space"
        const noMountingAnimation = true
        const choices = [{
            values: ["choice0 c0", "choice1 c1"],
            selection: true,
        }]
        const options = { base, noMountingAnimation, choices }
        let fullClass = null
        act(() => {
            render(<TestComponent
                options={options}
                onUseClassName={(str) => fullClass = str}
            />, root)
        })
        
        expect(fullClass.includes("SomeBase with some space")).toBe(true)
        expect(fullClass.includes("noMountingAnimation")).toBe(true)
        expect(fullClass.includes("choice1 c1")).toBe(true)
        expect(fullClass.split(' ').length).toBe(7)
    })
    
    it("ignores empty strings (ie does not join with spaces between them)", () => {
        const base = ""
        const noMountingAnimation = true
        const choices = [{
            values: ["", ""],
            selection: true,
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
                const options = { base: null }
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
        
        it("throws when an invalid choice-value is given", () => {
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
                            selection: 0,
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
                            selection: 0,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        })
        
        it("throws when the selection is out-of-bounds of the choice-values list", () => {
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: ["val0", "val1"],
                            selection: 2,
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
                            selection: "bad selection!",
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
                            selection: 7,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).toThrow(TypeError)
        })
        
        it("throws when a non-string (truthy) value is returned", () => {
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: [true],
                            selection: 0,
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
                            selection: 0,
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
                            values: [null],
                            selection: 0,
                        },
                    ],
                }
                renderErrorTestWith(options)
            }).not.toThrow()
        })
    })
})
