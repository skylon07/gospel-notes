class LunrWorker {
    constructor(refName, ...fields) {
        if (!refName || typeof refName !== "string") {
            throw new Error("LunrWorker objects must be created with a string");
        }

        this._idx = lunr(idx => {
            idx.ref(refName);
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                idx.field(field);
            }
        });
        this._refName = refName;
        this._origRefKey = Symbol();
        this._docs = {};
    }

    doc(refOrDoc) {
        if (typeof refOrDoc === "string") {
            refOrDoc = this._docs[refOrDoc];
        }
        return refOrDoc;
    }

    add(doc) {
        this._recordNewDoc(doc);
        this._idx.add(doc);
    }
    _recordNewDoc(doc) {
        const ref = doc[this._refName];
        if (this._docs[ref]) {
            throw new Error(`LunrWorker cannot re-add document '${ref}'`);
        }

        this._docs[ref] = doc;

        if (doc[this._origRefKey] === undefined) {
            this._wrapRefProp(doc);
        }
    }

    remove(ref) {
        const doc = this.doc(ref);
        if (!doc) {
            throw new Error(`LunrWorker.remove() failed: '${ref} is an invalid reference'`);
        }
        ref = doc[this._refName];

        delete this._docs[ref];
        this._idx.remove(doc);
    }

    update(ref, newRef = null) {
        const doc = this.doc(ref);
        if (!doc) {
            throw new Error(`LunrWorker.update() failed: '${ref} is an invalid reference'`);
        }
        ref = doc[this._refName];

        if (typeof newRef === "string") {
            delete this._docs[ref];
            this._idx.remove(doc);

            doc[this._refName] = { value: newRef, _inUpdate: true };
            this._docs[newRef] = doc;
            this._idx.add(doc);
        } else if (newRef) {
            const newDoc = newRef;
            newRef = newDoc[this._refName];

            delete this._docs[ref];
            this._idx.remove(doc);

            this._docs[newRef] = newDoc;
            this._idx.add(newDoc);
        } else {
            this._idx.update(doc);
        }
    }

    copyDocsTo(listRef = {}, filter = null) {
        // return array
        if (Array.isArray(listRef)) {
            for (const ref in this._docs) {
                const doc = this._docs[ref];
                if (typeof filter === "function") {
                    if (filter(doc)) {
                        listRef.push(doc);
                    }
                } else {
                    listRef.push(doc);
                }
            }
        }

        // return object dictionary
        else {
                for (const ref in this._docs) {
                    const doc = this._docs[ref];
                    if (typeof filter === "function") {
                        if (filter(doc)) {
                            listRef[ref] = doc;
                        }
                    } else {
                        listRef[ref] = doc;
                    }
                }
            }

        return listRef;
    }

    search(query) {
        const result = this._idx.search(query);
        const resultMapped = result.map(({ ref, score }) => {
            return { refName: ref, ref: this.doc(ref), score };
        });
        return resultMapped;
    }

    asJSON() {
        return JSON.stringify(this._idx);
    }

    loadFrom(str, docList) {
        this._idx = lunr.Index.load(JSON.parse(str));

        this._docs = {};
        if (Array.isArray(docList)) {
            for (let i = 0; i < docList.length; i++) {
                this._recordNewDoc(docList[i]);
            }
        } else {
            for (const docRef in docList) {
                this._recordNewDoc(docList[docRef]);
            }
        }
    }

    _wrapRefProp(doc) {
        const refKey = this._origRefKey;
        doc[refKey] = doc[this._refName];
        Object.defineProperty(doc, this._refName, {
            get() {
                return doc[refKey];
            },
            set(val) {
                if (typeof val !== "object" || !val._inUpdate) {
                    throw new Error("LunrWorker restircts manually updating document references (use the update() method instead)");
                }
                doc[refKey] = val.value;
            }
        });
    }
}
