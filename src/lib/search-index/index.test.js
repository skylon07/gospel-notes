import {
    SearchIndex,
    SearchIndexCreationError,
    SearchIndexDocumentError,
} from ".";

let index = null;
beforeEach(() => {
    index = new SearchIndex();
});
afterEach(() => {
    index = null;
});

function numberOfDocuments(idx = index) {
    return idx._idx.documentStore.length;
}

function documentStore(idx = index) {
    return idx._idx.documentStore.store;
}

it("initializes with an index of zero documents", () => {
    expect(numberOfDocuments()).toBe(0);
});

describe("document update tests", () => {
    it("adds new documents to the index", () => {
        index.setReference("ref", "value");
        expect(numberOfDocuments()).toBe(1);
    });

    it("removes documents from the index", () => {
        index.setReference("ref", "value");
        index.deleteReference("ref");
        expect(numberOfDocuments()).toBe(0);
    });

    it("correctly updates documents already added to the index", () => {
        index.setReference("ref", "oldVal");
        index.setReference("ref", "newVal");
        const asArrayBecauseItIsntForSomeReason = JSON.stringify(
            documentStore()["ref"]
        );
        const arr = JSON.parse(asArrayBecauseItIsntForSomeReason);
        expect(arr).toStrictEqual(["newval"]); // lunr parses as lowercase
    });

    it("errors when setting a non-string reference", () => {
        expect(() => {
            index.setReference({ ref: "this no work" });
        }).toThrow(SearchIndexDocumentError);
    });

    it("errors when adding a non-string field", () => {
        expect(() => {
            index.setReference(
                "ref",
                "valid field",
                { not: "valid" },
                "another valid field"
            );
        });
    });
});

describe("search query tests", () => {
    beforeEach(() => {
        index.setReference("red", "color warm");
        index.setReference("blue", "color water cold");
        index.setReference("apple", "red food cold");
    });

    it("returns a SearchQuery()", () => {
        const result = index.search("");
        // expect(result).toBeInstanceOf(SearchQuery) // SearchQuery cannot be imported
        expect(result.constructor.name).toBe("SearchQuery");
    });

    it("returns the most relevant reference name", () => {
        const result = index.search("cold color");
        expect(result.refName).toBe("blue");
    });

    it("returns the relevance score", () => {
        const result = index.search("cold color");
        expect(typeof result.score).toBe("number");
    });

    it("returns the nth most relevant result", () => {
        const result = index.search("cold color");
        expect(result.getRefName(0)).toBe("blue");
        expect(result.getRefName(1)).toBe("red");
        expect(result.getRefName(2)).toBe("apple");
    });

    it("returns the nth relevance score", () => {
        const result = index.search("cold color");
        expect(typeof result.getScore(1)).toBe("number");
    });

    it("returns the number of results", () => {
        const result = index.search("cold color");
        expect(result.numResults).toBe(3);
    });

    it("does not include irrelevant results", () => {
        const result = index.search("color");
        expect(result.numResults).toBe(2);
        expect(result.getRefName(0)).not.toBe("apple");
        expect(result.getRefName(1)).not.toBe("apple");
    });
});

describe("serialization tests", () => {
    beforeEach(() => {
        index.setReference("ref", "field");
        index.setReference("anotherRef", "field2");
    });

    it("serializes to a string", () => {
        const str = SearchIndex.serialize(index);
        expect(typeof str).toBe("string");
    });

    it("can be initialized from a serialized string", () => {
        const str = SearchIndex.serialize(index);
        const newIdx = SearchIndex.createFrom(str);

        expect(numberOfDocuments(newIdx)).toBe(2);

        const store = documentStore(newIdx);
        const storeObj = JSON.parse(JSON.stringify(store)); // converts not-arrays to arrays
        expect(storeObj.ref).toStrictEqual(["field"]);
        expect(storeObj.anotherRef).toStrictEqual(["field2"]);
    });
});
