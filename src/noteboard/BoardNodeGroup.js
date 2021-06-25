import React, { useContext } from "react";
import { useForceUpdate } from "common/hooks";
import { useSameNode, useNodeUpdate } from "./BoardNode.js";
import PropTypes from "prop-types";

import nodeStore from "./datastore.js";
import NodePropTypes from "./datastore-proptypes.js";

import { NoteBoardCallbacks } from "./NoteBoard.js";
import BoardNode from "./BoardNode.js";

// has two main jobs: render BoardNodes from nodes/ids, and update them when a
// node's children are updated (which acts as a rendering neck/optimization,
// keeping children from being rerendered when a BoardNode gets a data change)

// BoardNodeGroups should not make any calls to onNodeChildrenChange, as it
// should only rerender BoardNodes on subscription updates, and not cause
// updates themselves
const BoardNodeGroup = React.memo(function (props) {
    const forceUpdate = useForceUpdate();

    const node = useSameNode(props.node, "BoardNodeGroup");
    useNodeUpdate(node, "children", forceUpdate);

    const callbacks = useContext(NoteBoardCallbacks);

    // NOTE: props.children is only considered when no representative node is
    //       given; however, using props.children allows converting data to
    //       BoardNodes without having a parent node available
    const children = node?.children || props.children;

    return renderBoardNodes(children, callbacks, props.readOnly);
});
BoardNodeGroup.propTypes = {
    children: NodePropTypes.listOfNodesOrElements,
    node: NodePropTypes.nodeOrId,
    readOnly: PropTypes.bool,
};
BoardNodeGroup.defaultProps = {
    readOnly: false,
};
export default BoardNodeGroup;

// recursively traverses data and returns it with generated BoardNodes
function renderBoardNodes(child, callbacks, readOnly) {
    if (Array.isArray(child)) {
        return child.map((elem) => renderBoardNodes(elem, callbacks, readOnly));
    } else if (nodeStore.isNodeId(child) || nodeStore.isNode(child)) {
        const node = nodeStore.getNodeById(child);
        return <BoardNode key={node.id} node={node} readOnly={readOnly} />;
    } else {
        return child === undefined ? null : child;
    }
}
