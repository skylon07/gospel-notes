import React from "react"
import PropTypes from "prop-types"
import "./NoteBoard.css"

import NodePropTypes from "./datastore-proptypes.js"

import BoardNodeGroup from "./BoardNodeGroup.js"

export const NoteBoardCallbacks = React.createContext()

function NoteBoard(props) {
    const onNodeDataChange = (node, dataName, newData) => {
        trigger(props.onNodeDataChange, node, dataName, newData)
    }
    const onNodeChildrenChange = (node) => {
        trigger(props.onNodeChildrenChange, node)
    }
    const callbacks = { onNodeDataChange, onNodeChildrenChange }

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
    onNodeChildrenChange: PropTypes.func,
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
