import { NodeSearchIndex } from "./nodeindex.js";
import { nodeStore } from "noteboard";

let nodeIndex = null;
let lunrIndex = null;
beforeEach(() => {
    nodeIndex = new NodeSearchIndex();
    // track calls to lunr index functions
    lunrIndex = nodeIndex._index;
    lunrIndex.setReference = jest.fn(lunrIndex.setReference.bind(lunrIndex));
    lunrIndex.deleteReference = jest.fn(
        lunrIndex.deleteReference.bind(lunrIndex)
    );

    nodeStore.DANGEROUS_clearForTestingOnly();
});
afterEach(() => {
    nodeIndex = null;
    lunrIndex = null;
});

it("initially has no nodes stored in the index", () => {
    expect(lunrIndex.setReference).not.toBeCalled();
    expect(lunrIndex.deleteReference).not.toBeCalled();
});

describe("updating node tests", () => {
    it("updates the index with the NoteBox title and content", () => {
        const title = "notebox title";
        const content = "notebox content";
        const node = nodeStore.createNode("NoteBox", { title, content });
        nodeIndex.updateNode(node);

        expect(lunrIndex.setReference).toBeCalledTimes(1);
        expect(lunrIndex.setReference).toBeCalledWith(node.id, title, content);
    });

    it("updates the index with the DropBar title", () => {
        const title = "dropbar title";
        const iconType = "dropbar icon type";
        const node = nodeStore.createNode("DropBar", { title, iconType });
        nodeIndex.updateNode(node);

        expect(lunrIndex.setReference).toBeCalledTimes(1);
        expect(lunrIndex.setReference).toBeCalledWith(node.id, title);
    });

    it("updates multiple given nodes in the index", () => {
        const noteBoxTitles = [
            "first notebox title",
            "second notebox title",
            "third notebox title",
        ];
        const noteBoxContents = [
            "first notebox content",
            "second notebox content",
            "third notebox content",
        ];
        const dropBarTitles = [
            "first dropbar title",
            "second dropbar title",
            "third dropbar title",
        ];

        const noteBoxNodes = [];
        const dropBarNodes = [];
        for (let i = 0; i < 3; i++) {
            const noteBoxData = {
                title: noteBoxTitles[i],
                content: noteBoxContents[i],
            };
            const noteBoxNode = nodeStore.createNode("NoteBox", noteBoxData);
            noteBoxNodes.push(noteBoxNode);
            nodeIndex.updateNode(noteBoxNode);

            const dropBarData = {
                title: dropBarTitles[i],
            };
            const dropBarNode = nodeStore.createNode("DropBar", dropBarData);
            dropBarNodes.push(dropBarNode);
            nodeIndex.updateNode(dropBarNode);
        }

        expect(lunrIndex.setReference).toBeCalledTimes(6);
        for (let i = 0; i < 3; i++) {
            expect(lunrIndex.setReference).toBeCalledWith(
                noteBoxNodes[i].id,
                noteBoxTitles[i],
                noteBoxContents[i]
            );
            expect(lunrIndex.setReference).toBeCalledWith(
                dropBarNodes[i].id,
                dropBarTitles[i]
            );
        }
    });
});

it("deletes node from the index", () => {
    const title = "some node title, I don't know";
    const content = "okay you caught me, it's a NoteBox";
    const node = nodeStore.createNode("NoteBox", { title, content });
    nodeIndex.updateNode(node);
    nodeIndex.deleteNode(node);

    expect(lunrIndex.setReference).toBeCalledTimes(1);
    expect(lunrIndex.deleteReference).toBeCalledTimes(1);
});
