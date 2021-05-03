import React from "react";
import PropTypes from "prop-types";
import "./NoteBox.css";

export default class NoteBox extends React.Component {
    static propTypes = {
        initTitle: PropTypes.string,
        initContent: PropTypes.string,
        canChange: PropTypes.bool,
        onChangeTitle: PropTypes.func,
        onChangeContent: PropTypes.func,
    };
    
    shouldComponentUpdate(nextProps, nextState) {
        // NOTE: changes in "init..." props can be ignored
        return nextProps.onChangeTitle !== this.props.onChangeTitle ||
           nextProps.onChangeContent !== this.props.onChangeContent
    }

    constructor(props) {
        super(props);

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
        return (
            <div data-testid="note-box" className="NoteBox">
                {this.renderTitle()}
                {this.renderContent()}
            </div>
        );
    }

    renderTitle() {
        let title = this.props.initTitle;
        this.lastTitle = title;

        if (!title) {
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
        let content = this.props.children || this.props.initContent;
        this.lastContent = content;

        if (!content) {
            return null;
        }
        
        if (this.canChange()) {
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
    
    canChange() {
        if (typeof this.props.canChange === "boolean") {
            return this.props.canChange
        }
        return true
    }
    
    detectIfTextAreaChanged(newStr, lastStr, onChange) {
        if (typeof onChange !== "function") {
            // detecting won't trigger anything...
            // might as well not try!
            return
        }
        
        if (newStr !== lastStr) {
            // convert breaks to newlines
            // NOTE: eval is used to generate the regex; this is perfectly
            //       safe usage (talking to you eslint)
            // eslint-disable-next-line
            const regex = eval("/<br>/gi")
            let str = newStr.replace(regex, "\n");

            // ensure first/last characters are ommitted when newlines
            if (str[0] === "\n") {
                str = str.slice(1);
            }
            if (str[str.length - 1] === "\n") {
                str = str.slice(0, str.length - 1);
            }
            
            onChange(str);
        }
    }

    detectIfTitleChanged() {
        // prettier-ignore
        this.detectIfTextAreaChanged(
            this.titleRef.current.value,
            this.lastTitle,
            this.props.onChangeTitle
        );
    }
    detectIfContentChanged() {
        // prettier-ignore
        this.detectIfTextAreaChanged(
            this.contentRef.current.value,
            this.lastContent,
            this.props.onChangeContent
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
}
