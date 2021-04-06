import lunr from './lunr.min.js'

class SearchIndexCreationError extends Error {
    constructor(msg) {
        super(msg)
        this.name = "SearchIndexCreationError"
    }
}

export class SearchIndex {
    constructor(refName, ...fields) {
        if (typeof refName !== "string" || refName === "") {
            throw new SearchIndexCreationError("Search Indexes must be given a property string to use as a reference name")
        }

        this._idx = lunr((idx) => {
            idx.ref(refName)
            for (const field of fields) {
                idx.field(field)
            }
        })
        this._refPropName = refName
    }

    // NOTE: refName is constant after creation to ensure returned
    //       document objects all use this required property
    get refPropName() {
        return this._refPropName
    }
}

class SearchQuery {
    constructor(refProp, score) {

    }
}
