import React from "react";
import { useClassName } from "common/hooks"
import PropTypes from "prop-types";
import "./styles.css";

// creates references for all icon representations
const created = {
    icons: {},
    iconNames: [],
};
function create(name, svgCallback) {
    created.icons[name] = svgCallback();
    created.iconNames.push(name);
}

// icon representation definitions
function iconBlank() {
    return <svg viewBox="0 0 100 100"></svg>;
}
create("blank", iconBlank);

function iconBars() {
    const left = 20;
    const right = 80;

    const top = 30;
    const mid = 50;
    const bottom = 70;

    return (
        <svg viewBox="0 0 100 100">
            <line x1={left} x2={right} y1={top} y2={top} />
            <line x1={left} x2={right} y1={mid} y2={mid} />
            <line x1={left} x2={right} y1={bottom} y2={bottom} />
        </svg>
    );
}
create("bars", iconBars);
create("burger", iconBars);

function iconMagGlass() {
    const glassCenter = [60, 40];
    const glassSize = 20;

    const handleLeft = 20;
    const handleRight = 45;
    const handleTop = 55;
    const handleBottom = 80;

    return (
        <svg viewBox="0 0 100 100">
            <ellipse
                cx={glassCenter[0]}
                cy={glassCenter[1]}
                rx={glassSize}
                ry={glassSize}
            />
            <line
                x1={handleLeft}
                y1={handleBottom}
                x2={handleRight}
                y2={handleTop}
            />
        </svg>
    );
}
create("magGlass", iconMagGlass);

function iconBackArrow() {
    // offset calculation is used to create a nice, crisp point with the pyth-theo
    const strokeWidth = 5; // in pixels
    const offset = (strokeWidth * 2 ** (1 / 2)) / 4;

    const left = 23;
    const right = 77;
    const xMid = 46;

    const top = 27;
    const bottom = 73;
    const yMid = 50;

    return (
        <svg viewBox="0 0 100 100">
            <line x1={left - offset} y1={yMid + offset} x2={xMid} y2={top} />
            <line x1={left} y1={yMid} x2={right} y2={yMid} />
            <line x1={left - offset} y1={yMid - offset} x2={xMid} y2={bottom} />
        </svg>
    );
}
create("backArrow", iconBackArrow);

function iconPlus() {
    const left = 23;
    const right = 77;
    const mid = 50;
    const top = 23;
    const bottom = 77;

    return (
        <svg viewBox="0 0 100 100">
            <line x1={left} x2={right} y1={mid} y2={mid} />
            <line x1={mid} x2={mid} y1={top} y2={bottom} />
        </svg>
    );
}
create("plus", iconPlus);

function iconCross() {
    const left = 23;
    const right = 77;
    const top = 23;
    const bottom = 77;
    
    return (
        <svg viewBox="0 0 100 100">
            <line x1={left} x2={right} y1={top} y2={bottom} />
            <line x1={right} x2={left} y1={top} y2={bottom} />
        </svg>
    );
}
create("cross", iconCross)
create("invalid", iconCross)

// custom prop-type function
export function SVGIconPropType(props, propName, componentName) {
    const svgIcon = props[propName];
    if (typeof svgIcon !== "object" || svgIcon.type !== SVGIcon) {
        return new Error(
            `Invalid prop '${propName}' supplied to '${componentName}'. Expected an <SVGIcon /> component; Got a(n) '${typeof svgIcon}'.`
        );
    }
}

// main interface component that wraps everything together
function SVGIcon(props) {
    const className = useClassName({
        base: "SVGIcon",
        filters: [{
            value: props.type,
            useIf: created.icons[props.type],
            otherwise: "invalid",
        }],
    })
    
    const svg = created.icons[props.type] || created.icons.invalid;
    return <div data-testid="svg-icon" className={className}>
        {svg}
    </div>
}
SVGIcon.propTypes = {
    type: PropTypes.oneOf(created.iconNames),
}
SVGIcon.defaultProps = {
    type: "blank",
}
SVGIcon.types = created.iconNames
export { SVGIcon }
