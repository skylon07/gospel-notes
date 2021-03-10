class RegistryCreationError extends Error {
    constructor(msg) {
        super(msg);
        this.name = "RegistryCreationError";
    }
}

class RegistryStoreError extends Error {
    constructor(msg) {
        super(msg);
        this.name = "RegistryStoreError";
    }
}

// a dictionary of parsing separators
const SEPARATORS = {
    // item: '≡' + ';' + '≡', // using '+' allows loading this file without confusing the parser
    // pair: '≡' + ',' + '≡',
    item: "≡;≡",
    pair: "≡,≡",
};

// a registry for localStorage management
export class StorageRegistry {
    static DANGEROUS_clearStorage() {
        localStorage.clear();
    }

    constructor(storageKey) {
        if (!storageKey || typeof storageKey !== "string") {
            throw new RegistryCreationError(
                `StorageRegistry must be created with a non-null string (got '${storageKey}')`
            );
        }

        this._storageKey = storageKey;
        this._updateQueued = false;
        this._reset = false;
        this._initStoredStrs();
    }

    onStoreFinish() {
        // overridden by implementation
    }
    onStoreFull() {
        // overridden by implementation
    }
    onStoreError(error) {
        // overridden by implementation
    }

    get keys() {
        return Object.keys(this._strs);
    }

    get empty() {
        return this.numberKeys === 0;
    }

    get numberKeys() {
        return this.keys.length;
    }

    getKey(key) {
        const result = this._strs[key];
        if (result === undefined) {
            return null;
        }
        return result;
    }

    // NOTE: key/str pair is stored immediately, but localStorage is updated asyncronously
    setKeyString(key, str) {
        if (key === "") {
            throw new RegistryStoreError(
                `Cannot set empty string ('') as storage key`
            );
        }
        if (typeof str !== "string" && typeof str !== "number") {
            if (typeof str === "symbol") {
                str = "Symbol()";
            }
            throw new RegistryStoreError(
                `Cannot set storage key '${key}' to non-string/number '${str}'`
            );
        }
        if (str.includes(SEPARATORS.pair) || str.includes(SEPARATORS.item)) {
            throw new RegistryStoreError(
                `Registry cannot store strings with reserved substrings '${SEPARATORS.pair}' or '${SEPARATORS.item}'`
            );
        }

        this._strs[key] = str;
        this._requestUpdate();
    }

    resetKey(key) {
        delete this._strs[key];
        this._requestUpdate();
    }

    reset(mode = "") {
        this._strs = {};
        if (mode === "hard") {
            localStorage.removeItem(this._storageKey);
        }
    }

    _initStoredStrs() {
        const storageStr = localStorage[this._storageKey] || "";
        this._strs = {};

        if (!storageStr) {
            return;
        }

        for (let pair of storageStr.split(SEPARATORS.item)) {
            let [key, str] = pair.split(SEPARATORS.pair);
            this._strs[key] = str;
        }
    }

    _requestUpdate() {
        if (!this._updateQueued) {
            // delay is a security and optimization measure (mostly for async functions);
            // its less likely to save "crashing data" and batches more set requests together
            setTimeout(() => this._updateStorage(), 100);
            this._updateQueued = true;
        }
    }

    _updateStorage() {
        this._updateQueued = false;

        let storageList = [];
        for (const key in this._strs) {
            const str = this._strs[key];
            const pair = `${key}${SEPARATORS.pair}${str}`;
            storageList.push(pair);
        }

        try {
            localStorage[this._storageKey] = storageList.join(SEPARATORS.item);
            this.onStoreFinish();
        } catch (error) {
            if (error.name === "QuotaExceededError") {
                this.onStoreFull();
            } else {
                this.onStoreError(error);
            }
        }
    }
}
