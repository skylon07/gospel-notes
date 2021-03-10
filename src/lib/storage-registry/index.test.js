import { StorageRegistry, RegistryStoreError } from ".";

describe("tests", () => {
    let storage;

    beforeEach(() => {
        storage = new StorageRegistry("test");
    });

    test("keys with zero keys", () => {
        expect(storage.keys).toStrictEqual([]);
    });

    test("keys with one key", () => {
        storage.setKeyString("key", "val");
        expect(storage.keys).toStrictEqual(["key"]);
    });

    test("keys with two keys", () => {
        storage.setKeyString("key", "val");
        storage.setKeyString("key2", "val2");
        expect(storage.keys).toIncludeSameMembers(["key", "key2"]);
    });

    test("numberKeys with zero keys", () => {
        expect(storage.numberKeys).toBe(0);
    });

    test("numberKeys with one key", () => {
        storage.setKeyString("key", "val");
        expect(storage.numberKeys).toBe(1);
    });

    test("numberKeys with two keys", () => {
        storage.setKeyString("key", "val");
        storage.setKeyString("key2", "val2");
        expect(storage.numberKeys).toBe(2);
    });

    test("empty when empty", () => {
        expect(storage.empty).toBe(true);
    });

    test("empty when not empty", () => {
        storage.setKeyString("key", "val");
        expect(storage.empty).toBe(false);
    });

    test("getKey with non-existing key", () => {
        expect(storage.getKey("key")).toBe(null);
    });

    test("getKey with existing key", () => {
        storage.setKeyString("key", "val");
        expect(storage.getKey("key")).toBe("val");
    });

    test("setKeyString with valid string doesn't throw", () => {
        expect(storage.setKeyString("key", "val")).toBe(undefined);
    });

    test("setKeyString with empty string throws", () => {
        expect(() => {
            storage.setKeyString("", "val");
        }).toThrow(RegistryStoreError);
    });

    test("setKeyString with separator string throws", () => {
        expect(() => {
            storage.setKeyString("key", "≡;≡");
        }).toThrow(RegistryStoreError);
        expect(() => {
            storage.setKeyString("key", "≡,≡");
        }).toThrow(RegistryStoreError);
    });
});
