import { SearchIndex, SearchIndexCreationError } from ".";

let index = null;
beforeEach(() => {
    index = new SearchIndex("refName");
});
afterEach(() => {
    index = null;
});

it("gives and initializes with the correct reference name", () => {
    expect(index.refName).toBe("refName");
});

describe("document update tests", () => {
    it("adds new documents to the index", () => {
        throw new Error("// TODO: INCOMPLETE TEST");
    });

    it("removes documents from the index", () => {
        throw new Error("// TODO: INCOMPLETE TEST");
    });

    it("correctly updates documents already added to the index", () => {
        throw new Error("// TODO: INCOMPLETE TEST");
    });
});

describe("search query tests", () => {
    it("returns a SearchQuery()", () => {
        throw new Error("// TODO: INCOMPLETE TEST");
    });

    it("returns the reference name the object was stored by", () => {
        throw new Error("// TODO: INCOMPLETE TEST");
    });

    it("returns the relevance score", () => {
        throw new Error("// TODO: INCOMPLETE TEST");
    });
});

describe("serialization tests", () => {
    it("serializes to a string", () => {
        throw new Error("// TODO: INCOMPLETE TEST");
    });

    it("can be initialized from a serialized string", () => {
        throw new Error("// TODO: INCOMPLETE TEST");
    });
});
