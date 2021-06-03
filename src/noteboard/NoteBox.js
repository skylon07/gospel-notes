import React from "react";
import PropTypes from "prop-types";
import "./NoteBox.css";

export default class NoteBox extends React.Component {
    static propTypes = {
        // update-ignored props
        initTitle: PropTypes.string,
        initContent: PropTypes.string,
        
        // update-honored props
        forceTitle: PropTypes.string,
        forceContent: PropTypes.string,
        canChange: PropTypes.bool,
        onTitleChange: PropTypes.func,
        onContentChange: PropTypes.func,
    };
    
    static getDerivedStateFromProps(props, state) {
        const { forceTitle, forceContent } = props
        // NOTE: state must be updated in case textareas were deleted
        if (typeof forceTitle === "string") {
            state.title = forceTitle
        }
        if (typeof forceContent === "string") {
            state.content = forceContent
        }
        return state
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        // NOTE: changes in "init..." props can be ignored
        return typeof nextProps.forceTitle === "string" ||
            typeof nextProps.forceContent === "string" ||
            nextProps.canChange !== this.props.canChange ||
            nextProps.onTitleChange !== this.props.onTitleChange ||
            nextProps.onContentChange !== this.props.onContentChange ||
            nextState.title !== this.state.title ||
            nextState.content !== this.state.content
    }

    constructor(props) {
        super(props);
        
        this.state = {
            title: props.initTitle || props.forceTitle,
            content: props.initContent || props.forceContent,
        }

        this.titleRef = React.createRef();
        this.contentRef = React.createRef();
        
        this.on = {
            // NOTE: onBlur() is used because onChange() isn't working as expected...
            blurTitle: () => this.detectIfTitleChanged(),
            blurContent: () => this.detectIfContentChanged(),
            titleInput: () => this.updateDims(this.titleRef.current, "title"),
            contentInput: () => this.updateDims(this.contentRef.current, "content"),
        }
    }

    render() {
        // console.log("RENDERED: NoteBox") // DEBUG
        return (
            <div data-testid="note-box" className="NoteBox">
                {this.renderTitle()}
                {this.renderContent()}
            </div>
        );
    }

    renderTitle() {
        const title = this.state.title
        if (!title) {
            // remove the element for empty text
            return null;
        }
        
        if (this.canChange()) {
            return (
                <textarea
                    ref={this.titleRef}
                    className="Title"
                    rows="1"
                    cols="1"
                    wrap="off"
                    onBlur={this.on.blurTitle}
                    onInput={this.on.titleInput}
                    defaultValue={title}
                />
            )
        } else {
            return <textarea
                ref={this.titleRef}
                className="Title"
                rows="1"
                cols="1"
                wrap="off"
                value={title}
                readOnly={true}
            />
        }
    }

    renderContent() {
        const content = this.state.content
        if (!content) {
            // remove the element for empty text
            return null;
        }
        
        if (this.canChange()) {
            // console.log("CAN CHANGE") // DEBUG
            return (
                <textarea
                    ref={this.contentRef}
                    className="Content"
                    rows="1"
                    cols="1"
                    onBlur={this.on.blurContent}
                    onInput={this.on.contentInput}
                    defaultValue={content}
                />
            );
        } else {
            return (
                <textarea
                    ref={this.contentRef}
                    className="Content"
                    rows="1"
                    cols="1"
                    value={content}
                    readOnly={true}
                />
            );
        }
    }

    componentDidMount() {
        this.initDims();
    }
    
    componentDidUpdate() {
        this.syncForceProps()
    }
    
    canChange() {
        if (typeof this.props.canChange === "boolean") {
            return this.props.canChange
        }
        return true
    }
    
    // wraps title value getter by returning null if it doesn't exist
    titleValue() {
        if (this.titleRef.current) {
            return this.titleRef.current.value || null
        }
        return null
    }
    
    // wraps content value getter by returning null if it doesn't exist
    contentValue() {
        if (this.contentRef.current) {
            return this.contentRef.current.value || null
        }
        return null
    }
    
    syncForceProps() {
        const { forceTitle, forceContent } = this.props
        if (typeof forceTitle === "string" && forceTitle !== "") {
            const title = this.titleRef.current
            title.value = forceTitle
        }
        if (typeof forceContent === "string" && forceContent !== "") {
            const content = this.contentRef.current
            content.value = forceContent
        }
    }
    
    detectIfTextAreaChanged(newStr, lastStr, onChange) {
        // console.log("DETECT") // DEBUG
        if (newStr !== lastStr) {
            // convert breaks to newlines
            // NOTE: eval is used to generate the regex; this is perfectly
            //       safe usage (talking to you eslint)
            // eslint-disable-next-line
            const regex = eval("/<br>/gi")
            let str = newStr
            if (str !== null) {
                str.replace(regex, "\n");
                // ensure first/last characters are ommitted when newlines
                if (str[0] === "\n") {
                    str = str.slice(1);
                }
                if (str[str.length - 1] === "\n") {
                    str = str.slice(0, str.length - 1);
                }
            }
            
            this._updateStateTitleAndContent()
            if (typeof onChange === "function") {
                onChange(str)
            }
        }
    }

    detectIfTitleChanged() {
        // prettier-ignore
        this.detectIfTextAreaChanged(
            this.titleValue(),
            this.state.title,
            this.props.onTitleChange
        );
    }
    detectIfContentChanged() {
        // prettier-ignore
        this.detectIfTextAreaChanged(
            this.contentValue(),
            this.state.content,
            this.props.onContentChange
        );
    }

    initDims() {
        const title = this.titleRef.current;
        if (title) {
            title.style.height = title.scrollHeight + "px";
            title.style.width = title.scrollWidth + "px";
        }

        const content = this.contentRef.current;
        if (content) {
            content.style.height = content.scrollHeight + "px";
            content.style.width = content.scrollWidth + "px";
        }
    }

    updateDims(elem, name) {
        if (!elem) {
            return
        }
        
        elem.style.height = "auto"; // allows shrinking
        elem.style.height = elem.scrollHeight + "px";

        if (name === "title") {
            elem.wrap = "off"; // potentially temporary, to see if it is still maxed
        }

        elem.style.width = "auto";
        elem.style.width = elem.scrollWidth + "px";

        if (name === "title") {
            const max = elem.parentNode.offsetWidth * 0.9 - 5; // gives a little wiggle room from the max
            const isMaxed = elem.offsetWidth > max;
            if (isMaxed) {
                elem.wrap = "on";
                elem.style.width = max;
            }
        }
    }
    
    _updateStateTitleAndContent() {
        this.setState({
            title: this.titleValue(),
            content: this.contentValue(),
        })
    }
}
