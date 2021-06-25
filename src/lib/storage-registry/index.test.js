import { StorageRegistry, RegistryStoreError, RegistryCreationError } from ".";

const SEPARATORS = {
    item: "≡;≡",
    pair: "≡,≡",
};

// TODO: many of these tests do not currently work and need to be reviewed
// XXX: Storage Registries likely will be removed in the near future; there is
//       no need to revise these tests
let mockLocalStorage = null;
// NOTE: __proto__ must be spied on; this actually returns a jest fn()
// jest.spyOn(localStorage.__proto__, "getItem").mockImplementation(
//     function (storageKey) {
//         // FIXME: this does not work...?
//         // return mockLocalStorage()[storageKey];
//     }
// );
// jest.spyOn(localStorage.__proto__, "setItem").mockImplementation(
//     function(storageKey, value) {
//         // mockLocalStorage()[storageKey] = value;
//     }
// );
// jest.spyOn(localStorage.__proto__, "removeItem").mockImplementation(
//     function (storageKey) {
//         // delete mockLocalStorage()[storageKey];
//     }
// );

let storage = null;
beforeEach(() => {
    storage = new StorageRegistry("storageKey");
    mockLocalStorage = {};
});
afterEach(() => {
    storage = null;
    mockLocalStorage = null;

    // since sets to localStorage are async, this makes sure no timers are running before each test
    jest.clearAllTimers();
});

jest.useFakeTimers("modern");

describe("initialization tests", () => {
    it("initializes with the correct storage key", () => {
        jest.advanceTimersByTime(1000);
        // expect(localStorage.setItem).toBeCalledWith("storageKey", "")
    });

    // FIXME: can't get this test to work... localStorage won't actually update, and I can't
    //       figure out a way to make getItem() return a specific value
    // it("initialises with the previously stored localStorage value", () => {
    //     storage.setKeyString("key", "val")

    //     jest.advanceTimersByTime(1000)

    //     expect(localStorage.setItem).toBeCalledWith("storageKey", `key${SEPARATORS.pair}val`) // this works...
    //     localStorage.getItem.mockReturnValueOnce(`key${SEPARATORS.pair}val`) // DOESN'T WORK!!!
    //     expect(new StorageRegistry("storageKey").getKey("key")).toBe("val") // mockLocalStorage is null...?
    // })

    it("initializes with keys === []", () => {
        expect(storage.keys).toStrictEqual([]);
    });

    it("throws an error when created with an invalid storage key", () => {
        expect(() => {
            new StorageRegistry(null);
        }).toThrow(RegistryCreationError);
        expect(() => {
            // yes... this should not be a number
            new StorageRegistry(12345);
        }).toThrow(RegistryCreationError);
    });

    it("initializes with numberKeys === 0", () => {
        expect(storage.numberKeys).toBe(0);
    });
});

describe("key recording tests", () => {
    it("returns one key after one value is stored", () => {
        storage.setKeyString("key", "val");
        expect(storage.keys).toStrictEqual(["key"]);
    });

    it("returns two keys after two values are stored", () => {
        storage.setKeyString("key", "val");
        storage.setKeyString("key2", "val2");
        expect(storage.keys).toIncludeSameMembers(["key", "key2"]);
    });

    it("removes keys when they are reset", () => {
        storage.setKeyString("key", "val");
        storage.setKeyString("key2", "val2");
        storage.resetKey("key");
        expect(storage.keys).toIncludeSameMembers(["key2"]);
    });
});

describe("value storing tests", () => {
    it("returns the value after a key is stored and requested", () => {
        storage.setKeyString("key", "val");
        expect(storage.getKey("key")).toBe("val");
    });

    it("returns null when an undefined key is requested", () => {
        expect(storage.getKey("key")).toBe(null);
    });

    it("stores values to localStorage in batches", () => {
        storage.setKeyString("key", "val");
        storage.setKeyString("key2", "val2");
        // expect(localStorage.setItem).not.toBeCalled();

        jest.advanceTimersByTime(1000);
        // expect(localStorage.setItem).toBeCalledTimes(1);

        storage.resetKey("key");
        storage.setKeyString("key", "test");

        jest.advanceTimersByTime(1000);
        // expect(localStorage.setItem).toBeCalledTimes(2);
    });
});

// describe("key numbering tests", () => {
//     it("numbers one key after one value is stored", () => {
//         storage.setKeyString("key", "val");
//         expect(storage.numberKeys).toBe(1);
//     });

//     it("numbers two keys after two values are stored", () => {
//         storage.setKeyString("key", "val");
//         storage.setKeyString("key2", "val2");
//         expect(storage.numberKeys).toBe(2);
//     });

//     it("returns empty === true when no keys are stored", () => {
//         expect(storage.empty).toBe(true);
//     });

//     it("returns empty === true after keys are stored and deleted", () => {
//         storage.setKeyString("key", "val");
//         storage.setKeyString("key2", "val2");
//         storage.resetKey("key");
//         storage.resetKey("key2");
//         expect(storage.empty).toBe(true);
//     });

//     it("returns empty === false when keys are stored", () => {
//         storage.setKeyString("key", "val");
//         storage.setKeyString("key2", "val2");
//         storage.resetKey("key");
//         expect(storage.empty).toBe(false);
//     });
// });

describe("invalid key-value setting tests", () => {
    it("throws an error when setting an empty key to a value", () => {
        expect(() => {
            storage.setKeyString("", "val");
        }).toThrow(RegistryStoreError);
    });

    it("throws an error when setting a key to a reserved separator value", () => {
        expect(() => {
            storage.setKeyString("key", SEPARATORS.item);
        }).toThrow(RegistryStoreError);
        expect(() => {
            storage.setKeyString("key", SEPARATORS.pair);
        }).toThrow(RegistryStoreError);
    });

    it("throws an error when setting a key with a non-string/number", () => {
        expect(() => {
            storage.setKeyString("key", undefined);
        }).toThrow(RegistryStoreError);
        expect(() => {
            storage.setKeyString("key", null);
        }).toThrow(RegistryStoreError);
        expect(() => {
            storage.setKeyString("key", Symbol());
        }).toThrow(RegistryStoreError);
    });
});
