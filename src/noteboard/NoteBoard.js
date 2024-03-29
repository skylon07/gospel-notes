import React, { useCallback, useMemo } from "react"
import PropTypes from "prop-types"
import "./NoteBoard.css"

import NodePropTypes from "./datastore-proptypes.js"

import BoardNodeGroup from "./BoardNodeGroup.js"

export const NoteBoardCallbacks = React.createContext()

function NoteBoard(props) {
    const onNodeDataChange = useCallback(
        (node, dataName, newData) => {
            trigger(props.onNodeDataChange, node, dataName, newData)
        },
        [props.onNodeDataChange]
    )
    const onNodeAddChild = useCallback(
        (parentNode, childNode) => {
            trigger(props.onNodeAddChild, parentNode, childNode)
        },
        [props.onNodeAddChild]
    )
    const onNodeRemoveChild = useCallback(
        (parentNode, childNode) => {
            trigger(props.onNodeRemoveChild, parentNode, childNode)
        },
        [props.onNodeRemoveChild]
    )
    const callbacks = useMemo(
        () => ({ onNodeDataChange, onNodeAddChild, onNodeRemoveChild }),
        [onNodeDataChange, onNodeAddChild, onNodeRemoveChild]
    )

    return (
        <div data-testid="note-board" className="NoteBoard">
            <NoteBoardCallbacks.Provider value={callbacks}>
                <BoardNodeGroup readOnly={props.readOnly}>
                    {props.children}
                </BoardNodeGroup>
            </NoteBoardCallbacks.Provider>
        </div>
    )
}
NoteBoard.propTypes = {
    children: NodePropTypes.listOfNodesOrElements,
    readOnly: PropTypes.bool,
    onNodeDataChange: PropTypes.func,
    onNodeAddChild: PropTypes.func,
    onNodeRemoveChild: PropTypes.func,
}
NoteBoard.defaultProps = {
    readOnly: false,
}
export default NoteBoard

function trigger(possibleFn, ...args) {
    if (typeof possibleFn === "function") {
        possibleFn(...args)
    }
}
