import React from "react";
import nodeStore from "./datastore.js";

const NodePropTypes = {
    node: createRequireablePropType((props, propName, componentName) => {
        const node = props[propName];
        if (!nodeStore.isNode(node)) {
            return new Error(
                `Invalid prop '${propName}' supplied to ${componentName}; expected a valid node, got '${node}'`
            );
        }
    }, "node"),
    nodeId: createRequireablePropType((props, propName, componentName) => {
        const nodeId = props[propName];
        if (!nodeStore.isNodeId(nodeId)) {
            return new Error(
                `Invalid prop '${propName}' supplied to ${componentName}; expected a valid nodeId, got '${nodeId}'`
            );
        }
    }, "nodeId"),
    nodeOrId: createRequireablePropType((props, propName, componentName) => {
        const nodeOrId = props[propName];
        if (!nodeStore.isNode(nodeOrId) && !nodeStore.isNodeId(nodeOrId)) {
            return new Error(
                `Invalid prop '${propName}' supplied to ${componentName}; expected a valid node or nodeId, got '${nodeOrId}'`
            );
        }
    }, "nodeOrId"),
    listOfNodesOrElements: createRequireablePropType(
        (props, propName, componentName) => {
            return listOfNodesOrElements(
                props,
                propName,
                componentName,
                propName
            );
        },
        "listOfNodesOrElements"
    ),
};
export default NodePropTypes;

function createRequireablePropType(typeFn, typeName) {
    const type = (props, propName, componentName) => {
        const prop = props[propName];
        if (prop === undefined || prop === null) {
            return null;
        } else {
            return typeFn(props, propName, componentName);
        }
    };

    type.isRequired = (props, propName, componentName) => {
        const prop = props[propName];
        if (prop === undefined || prop === null) {
            return new Error(
                `Invalid prop '${propName}' supplied to ${componentName}; a ${typeName} was required`
            );
        } else {
            return typeFn(props, propName, componentName);
        }
    };

    return type;
}

function listOfNodesOrElements(list, key, componentName, origPropName) {
    const prop = list[key];
    if (Array.isArray(prop)) {
        for (let i = 0; i < prop.length; i++) {
            const error = listOfNodesOrElements(
                prop,
                i,
                componentName,
                origPropName
            );
            if (error) {
                return error;
            }
        }
    } else {
        const isNode = nodeStore.isNode(prop) || nodeStore.isNodeId(prop);
        const isElement = React.isValidElement(prop);
        const isString = typeof prop === "string";
        const isNullish = prop === null || prop === undefined;
        if (!isNode && !isElement && !isString && !isNullish) {
            return new Error(
                `Invalid prop '${origPropName}' supplied to ${componentName}; expected a nested list of (or a single type of) valid React nodes or NodeParents or IDs of such, but instead got '${prop}'`
            );
        }
    }
    return null;
}
