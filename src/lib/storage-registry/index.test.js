import { StorageRegistry, RegistryStoreError, SEPARATORS } from ".";

let storage;

beforeEach(() => {
    storage = new StorageRegistry("test");
});

it("initializes with keys === []", () => {
    expect(storage.keys).toStrictEqual([]);
});

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

it("initializes with numberKeys === 0", () => {
    expect(storage.numberKeys).toBe(0);
});

it("numbers one key after one value is stored", () => {
    storage.setKeyString("key", "val");
    expect(storage.numberKeys).toBe(1);
});

it("numbers two keys after two values are stored", () => {
    storage.setKeyString("key", "val");
    storage.setKeyString("key2", "val2");
    expect(storage.numberKeys).toBe(2);
});

it("returns empty === true when no keys are stored", () => {
    expect(storage.empty).toBe(true);
});

it("returns empty === true after keys are stored and deleted", () => {
    storage.setKeyString("key", "val");
    storage.setKeyString("key2", "val2");
    storage.resetKey("key");
    storage.resetKey("key2");
    expect(storage.empty).toBe(true);
});

it("returns empty === false when keys are stored", () => {
    storage.setKeyString("key", "val");
    storage.setKeyString("key2", "val2");
    storage.resetKey("key");
    expect(storage.empty).toBe(false);
});

it("returns null when an undefined key is requested", () => {
    expect(storage.getKey("key")).toBe(null);
});

it("returns the value after a key is stored and requested", () => {
    storage.setKeyString("key", "val");
    expect(storage.getKey("key")).toBe("val");
});

it("doesn't throw on valid setKeyString() calls", () => {
    expect(storage.setKeyString("key", "val")).toBe(undefined);
});

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
