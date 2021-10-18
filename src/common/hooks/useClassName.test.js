import { cleanup } from "common/test-utils"
import { callHook } from "./HookTester.js"

import useClassName from "./useClassName.js"

afterEach(() => {
    cleanup()
})

describe("the 'base' option", () => {
    it("can take and return a base class", () => {
        const base = "SomeBaseClass"
        const options = { base }
        const fullClass = callHook(useClassName, options)
        expect(fullClass).toBe(base)
    })
})

describe("the 'noMountingAnimation' option", () => {
    it("returns the .noMountingAnimation class on the first render", () => {
        const options = { noMountingAnimation: true }
        const fullClass = callHook(useClassName, options)
        expect(fullClass).toBe("noMountingAnimation")
    })

    it("does not return the .noMountingAnimation class on subsequent renders", () => {
        const options = { noMountingAnimation: true }
        callHook(useClassName, options)

        // "subsequent renders" start here...
        let fullClass = callHook(useClassName, options)
        expect(fullClass).not.toBe("noMountingAnimation")
        // in fact, let's be more generic...
        expect(fullClass.includes("noMountingAnimation")).toBe(false)

        fullClass = callHook(useClassName, options)
        expect(fullClass.includes("noMountingAnimation")).toBe(false)
    })
})

describe("the 'choices' option", () => {
    it("can return a class from a dictionary of choices", () => {
        const choice = {
            values: { good: "goodClass", bad: "badClass" },
            useKey: "bad",
        }
        const options = { choices: [choice] }
        const fullClass = callHook(useClassName, options)
        expect(fullClass).toBe("badClass")
    })

    it("can return a class from a list of choices", () => {
        const choice = {
            values: ["class0", "class1", "class2"],
            useKey: 2,
        }
        const options = { choices: [choice] }
        const fullClass = callHook(useClassName, options)
        expect(fullClass).toBe("class2")
    })
})

describe("the 'filters' option", () => {
    it("returns the passed value when given 'true'", () => {
        const filter = {
            value: "value",
            useIf: true,
        }
        const options = { filters: [filter] }
        const fullClass = callHook(useClassName, options)
        expect(fullClass).toBe("value")
    })

    it("returns a blank string when given 'false'", () => {
        const filter = {
            value: "value",
            useIf: false,
        }
        const options = { filters: [filter] }
        const fullClass = callHook(useClassName, options)
        expect(fullClass).toBe("")
    })

    it("returns the default/'otherwise' value when given 'false'", () => {
        const filter = {
            value: "value",
            useIf: false,
            otherwise: "defaultClass",
        }
        const options = { filters: [filter] }
        const fullClass = callHook(useClassName, options)
        expect(fullClass).toBe("defaultClass")
    })
})

describe("the resulting joined classes string", () => {
    it("contains all classes separated by spaces", () => {
        const base = "SomeBase"
        const noMountingAnimation = true
        const choices = [
            {
                values: ["choice0", "choice1"],
                useKey: 1,
            },
        ]
        const filters = [
            {
                value: "IamValue",
                useIf: true,
            },
        ]
        const options = { base, noMountingAnimation, choices, filters }
        const fullClass = callHook(useClassName, options)
        expect(fullClass.includes("SomeBase")).toBe(true)
        expect(fullClass.includes("noMountingAnimation")).toBe(true)
        expect(fullClass.includes("choice1")).toBe(true)
        expect(fullClass.includes("IamValue")).toBe(true)
        expect(fullClass.split(" ").length).toBe(4)
    })

    it("preserves originally given spaces", () => {
        const base = "SomeBase with some space"
        const noMountingAnimation = true
        const choices = [
            {
                values: ["choice0 c0", "choice1 c1"],
                useKey: 0,
            },
        ]
        const filters = [
            {
                value: "dang why even filter this",
                useIf: true,
            },
        ]
        const options = { base, noMountingAnimation, choices, filters }
        const fullClass = callHook(useClassName, options)
        expect(fullClass.includes("SomeBase with some space")).toBe(true)
        expect(fullClass.includes("noMountingAnimation")).toBe(true)
        expect(fullClass.includes("choice0 c0")).toBe(true)
        expect(fullClass.includes("dang why even filter this")).toBe(true)
        expect(fullClass.split(" ").length).toBe(12)
    })

    it("does not have excess spaces after joining empty strings", () => {
        const base = ""
        const noMountingAnimation = false
        const choices = [
            {
                values: ["", ""],
                useKey: 1,
            },
        ]
        const filters = [
            {
                value: "not going to be used because...",
                useIf: false,
            },
        ]
        const options = { base, noMountingAnimation, choices, filters }
        const fullClass = callHook(useClassName, options)
        expect(fullClass.split(" ").length).toBe(1)
        // which basically means...
        expect(fullClass).toBe("")
    })
})

describe("error handling", () => {
    describe("about the options object itself", () => {
        it("only throws when an object is not given", () => {
            expect(() => {
                const options = null
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = 5
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = "an object but not really"
                callHook(useClassName, options)
            }).toThrow(TypeError)
        })
    })

    describe("inside the 'base' option", () => {
        it("only throws when a string is not given (and something else was)", () => {
            expect(() => {
                const options = { base: 3 }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = { base: () => "function that returns string" }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            // these are VALID
            expect(() => {
                const options = {}
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = { base: "" }
                callHook(useClassName, options)
            }).not.toThrow()
        })
    })

    describe("inside the 'noMountingAnimation' option", () => {
        it("only throws when the value can't be a boolean (oh wait... there isn't any)", () => {
            // these are ALL VALID! YAY
            expect(() => {
                const options = { noMountingAnimation: null }
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = { noMountingAnimation: "truthy" }
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = { noMountingAnimation: [] }
                callHook(useClassName, options)
            }).not.toThrow()
        })

        it("... basically never throws", () => {
            expect(() => {
                const options = {}
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = { noMountingAnimation: 3 }
                callHook(useClassName, options)
            }).not.toThrow()

            // yes... this should be considered truthy and not error
            expect(() => {
                const options = { noMountingAnimation: Symbol() }
                callHook(useClassName, options)
            }).not.toThrow()
        })
    })

    describe("inside the 'choices' option", () => {
        it("only throws when an array is not given (and something else was)", () => {
            expect(() => {
                const options = { choices: {} }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = { choices: 4 }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            // these are VALID
            expect(() => {
                const options = { choices: [] }
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = {}
                callHook(useClassName, options)
            }).not.toThrow()
        })

        it("only throws when an invalid choice is given", () => {
            expect(() => {
                const options = { choices: [4, 3] }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = { choices: [null] }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = {
                    choices: ["bad", "choice", "list"],
                }
                callHook(useClassName, options)
            }).toThrow(TypeError)
        })

        it("only throws when a bad choice-values list is given", () => {
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: null,
                            useKey: 0,
                        },
                    ],
                }
                callHook(useClassName, options)
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
                callHook(useClassName, options)
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
                callHook(useClassName, options)
            }).toThrow(TypeError)

            // these are VALID
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: { good: "", values: "" },
                            useKey: "good",
                        },
                    ],
                }
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = {
                    choices: [
                        {
                            values: ["an", "array", "of", "values"],
                            useKey: 1,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).not.toThrow()
        })

        it("only throws when the useKey is out-of-bounds of the choice-values list", () => {
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: ["val0", "val1"],
                            useKey: 2,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = {
                    choices: [
                        {
                            values: { some: "keys" },
                            useKey: "bad key!",
                        },
                    ],
                }
                callHook(useClassName, options)
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
                callHook(useClassName, options)
            }).toThrow(TypeError)
        })

        it("only throws when a non-string value is returned", () => {
            expect(() => {
                const options = {
                    choices: [
                        {
                            values: [true],
                            useKey: 0,
                        },
                    ],
                }
                callHook(useClassName, options)
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
                callHook(useClassName, options)
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
                callHook(useClassName, options)
            }).toThrow(TypeError)
        })
    })

    describe("inside the 'filters' option", () => {
        it("only throws when an array is not given (and something else was)", () => {
            expect(() => {
                const options = { filters: {} }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = { filters: 12 }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            // these are VALID
            expect(() => {
                const options = { filters: [] }
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = {}
                callHook(useClassName, options)
            }).not.toThrow()
        })

        it("only throws when an invalid filter is given", () => {
            expect(() => {
                const options = { filters: [9, 4] }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = { filters: [null] }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = {
                    filters: ["bad", "filter", "list"],
                }
                callHook(useClassName, options)
            }).toThrow(TypeError)
        })

        it("only throws when a bad filter-value is given", () => {
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: null,
                            useIf: false,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = {
                    filters: [
                        {
                            value: { bad: "value" },
                            useIf: false,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = {
                    filters: [
                        {
                            value: 5678,
                            useIf: false,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            // these are VALID
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: false,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).not.toThrow()
        })

        it("only throws when a bad filter-useIf is given (which is impossible)", () => {
            // these are ALL VALID! YAY
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: true,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: 5,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: "this is technically a truthy value",
                        },
                    ],
                }
                callHook(useClassName, options)
            }).not.toThrow()

            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: ["still", "a", "truthy", "value"],
                        },
                    ],
                }
                callHook(useClassName, options)
            }).not.toThrow()
        })

        it("only throws when a bad filter-otherwise is given", () => {
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: false,
                            otherwise: true,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: false,
                            otherwise: null,
                        },
                    ],
                }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: false,
                            otherwise: ["lots", "of", "values?"],
                        },
                    ],
                }
                callHook(useClassName, options)
            }).toThrow(TypeError)

            // these are VALID
            expect(() => {
                const options = {
                    filters: [
                        {
                            value: "",
                            useIf: false,
                            otherwise: "",
                        },
                    ],
                }
                callHook(useClassName, options)
            }).not.toThrow()
        })
    })
})
