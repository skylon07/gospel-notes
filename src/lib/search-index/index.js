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
    
    setReference(refName, ...fields) {
        this._checkRefType(refName)
        
        if (fields.length === 1 && Array.isArray(fields[0])) {
            fields = fields[0]
        }
        
        this._ensureFieldsCanHold(fields)
        
        const doc = this._createDoc(refName, fields)
        // NOTE: allows both adding and updating documents at the same time
        this._idx.remove(doc)
        this._idx.add(doc)
    }
    
    _createDoc(refName, fields) {
        const doc = {ref: refName}
        for (let i = 0; i < fields.length; i++) {
            const fieldType = typeof fields[i]
            if (fieldType !== "string" && fieldType !== "number") {
                throw new SearchIndexDocumentError(`An invalid field type (${fieldType}) was given; string expected`)
            }
            doc[i] = fields[i]
        }
        return doc
    }
    
    deleteReference(refName) {
        const shallowDoc = {ref: refName}
        this._idx.remove(shallowDoc)
    }
    
    search(query) {
        // TODO: strip special characters from query
        //       (specifically caret, colon, asterisk, tilde, plus, and minus)
        const search = this._idx.search(query)
        return new SearchQuery(search)
    }
    
    _ensureFieldsCanHold(fields) {
        while (fields.length > this._numFields) {
            this._idx.field(this._numFields)
            this._numFields += 1
        }
    }
    
    _checkRefType(refName) {
        if (typeof refName !== "string" && typeof refName !== "number") {
            throw new SearchIndexDocumentError(`The given reference type (${typeof refName}) is invalid; string expected`)
        }
    }
}

class SearchQuery {
    constructor(searchResult) {
        this._results = searchResult
    }
    
    get refName() {
        return this._results[0].ref
    }
    
    get score() {
        return this._results[0].score
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
    
    mapResults(fn, useOrig=false) {
        return this._results.map((value, index) => {
            let valToPass = useOrig ? value : value.ref
            const mapped = fn(valToPass, index)
            return mapped
        })
    }
}
