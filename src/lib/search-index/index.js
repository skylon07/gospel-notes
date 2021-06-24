import lunr from './lunr.js'

class SearchIndexCreationError extends Error {
    constructor(msg) {
        super(msg)
        this.name = "SearchIndexCreationError"
    }
}

class SearchIndexDocumentError extends Error {
    constructor(msg) {
        super(msg)
        this.name = "SearchIndexDocumentError"
    }
}

const SERIAL_SEPARATOR = "§"
const SKIP_CONSTRUCTION = Symbol()
export class SearchIndex {
    static serialize(index) {
        const json = JSON.stringify(index._idx);
        const serialized = index._numFields + SERIAL_SEPARATOR + json
        return serialized
    }
    
    static createFrom(serialized) {
        const sepIdx = serialized.indexOf(SERIAL_SEPARATOR)
        
        const nFields = parseInt(serialized.slice(0, sepIdx))
        const json = serialized.slice(sepIdx + 1)
        
        let parsed = null
        try {
            parsed = JSON.parse(json)
        }
        catch (error) {
            throw new SearchIndexCreationError(`JSON parsing failed: ${error.message}`)
        }
        
        const index = new SearchIndex(SKIP_CONSTRUCTION)
        index._idx = lunr.Index.load(parsed);
        index._numFields = nFields
        return index
    }
    
    constructor(skip=null) {
        if (skip === SKIP_CONSTRUCTION) {
            return
        }
        
        this._idx = lunr((idx) => {
            idx.ref("ref")
        })
        this._numFields = 0
        // TODO: add boosts for fields
    }
    
    // simply meant as an alias for adding/deleting/updating documents
    doc(ref, ...fields) {
        if (fields[0] === null) {
            this.deleteReference(ref)
        }
        else {
            this.setReference(ref, fields)
        }
    }
    
    // can set by (name, ...fields) or by (name, fields[])
    setReference(refName, ...fields) {
        if (fields.length === 1 && Array.isArray(fields[0])) {
            fields = fields[0]
        }
        
        const doc = this._createDoc(refName, fields)
        
        this._ensureIndexCanHold(fields)
        // remove/add allows both adding and updating documents (lunr already
        // uses this as its update algorithm)
        this._idx.remove(doc)
        this._idx.add(doc)
    }
    
    deleteReference(refName) {
        const shallowDoc = this._createDoc(refName, [])
        this._idx.remove(shallowDoc)
    }
    
    search(query) {
        // TODO: strip special characters from query
        //       (specifically caret, colon, asterisk, tilde, plus, and minus)
        const search = this._idx.search(query)
        return new SearchQuery(search)
    }
    
    _ensureIndexCanHold(fields) {
        while (fields.length > this._numFields) {
            this._idx.field(this._numFields)
            this._numFields += 1
        }
    }
    
    // TODO: move into its own helper class
    _createDoc(refName, fields) {
        this._checkRefType(refName)
        const doc = { ref: refName }
        
        for (let i = 0; i < fields.length; i++) {
            const fieldName = fields[i]
            this._checkFieldType(fieldName)
            doc[i] = fieldName
        }
        
        return doc
    }
    
    _checkRefType(refName) {
        if (typeof refName !== "string" && typeof refName !== "number") {
            throw new SearchIndexDocumentError(`The given reference type (${typeof refName}) is invalid; string expected`)
        }
    }
    
    _checkFieldType(fieldName) {
        if (typeof fieldName !== "string" && typeof fieldName !== "number") {
            throw new SearchIndexDocumentError(`An invalid field type (${fieldName}) was given; string (or number) expected`)
        }
    }
}

class SearchQuery {
    constructor(searchResult) {
        this._results = searchResult
    }
    
    get refName() {
        return this.getRefName(0)
    }
    
    get score() {
        return this.getScore(0)
    }
    
    get numResults() {
        return this._results.length
    }
    
    getRefName(idx) {
        idx = parseInt(idx) // ensures integer property
        const result = this._results[idx]
        if (!result) {
            return null
        }
        return result.ref
    }
    
    getScore(idx) {
        idx = parseInt(idx) // ensures integer property
        const result = this._results[idx]
        if (!result) {
            return null
        }
        return result.score
    }
    
    mapResults(fn) {
        return this._results.map((value, index) => {
            const mapped = fn(value.ref, index)
            return mapped
        })
    }
}
