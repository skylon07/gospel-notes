import React from "react";
import PropTypes from "prop-types";
import "./NoteBox.css";

export default class NoteBox extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        content: PropTypes.string,
        onTitleChange: PropTypes.func,
        onContentChange: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.titleRef = React.createRef();
        this.contentRef = React.createRef();
    }

    render() {
        return (
            <div className="NoteBox">
                {this.renderTitle()}
                {this.renderContent()}
            </div>
        );
    }

    renderTitle() {
        let title = this.props.title;
        if (Array.isArray(title)) {
            title = title.join("\n");
        }
        this.lastTitle = title;

        if (!title) {
            return null;
        }

        return (
            <textarea
                aria-label="note-title"
                ref={this.titleRef}
                className="Title"
                rows="1"
                cols="1"
                wrap="off"
                onBlur={() =>
                    this.detectIfTitleChanged(this.titleRef.current.value)
                }
                onInput={() => this.updateDims(this.titleRef.current, "title")}
                defaultValue={title}
            />
        );
    }

    renderContent() {
        let content = this.props.children || this.props.content;
        if (Array.isArray(content)) {
            content = content.join("\n");
        }
        this.lastContent = content;

        if (!content) {
            return null;
        }

        return (
            <textarea
                aria-label="note-content"
                ref={this.contentRef}
                className="Content"
                rows="1"
                cols="1"
                onBlur={() =>
                    this.detectIfContentChanged(this.contentRef.current.value)
                }
                onInput={() =>
                    this.updateDims(this.contentRef.current, "content")
                }
                defaultValue={content}
            />
        );
    }

    componentDidMount() {
        this.initDims();
    }

    componentDidUpdate() {
        if (!this.props.preventOverwrite) {
            const title = this.titleRef.current;
            if (title) {
                title.value = this.lastTitle;
                this.updateDims(title);
            }

            const content = this.contentRef.current;
            if (content) {
                content.value = this.lastContent;
                this.updateDims(content);
            }
        }
    }

    // NOTE: these are used during onBlur() because onChange() isnt working
    detectIfPropChanged(str, compStr, onChangeName) {
        if (str !== compStr) {
            // convert breaks to newlines
            str = str.replace(/<br>/gi, "\n");

            // ensure first/last characters are ommitted when newlines
            if (str[0] === "\n") {
                str = str.slice(1);
            }
            if (str[str.length - 1] === "\n") {
                str = str.slice(0, str.length - 1);
            }

            const onChange = this.props[onChangeName];
            if (onChange) {
                onChange(str);
            }
        }
    }

    detectIfTitleChanged(titleStr) {
        // prettier-ignore
        this.detectIfPropChanged(
            titleStr,
            this.lastTitle,
            "onTitleChange"
        );
    }
    detectIfContentChanged(contentStr) {
        // prettier-ignore
        this.detectIfPropChanged(
            contentStr,
            this.lastContent,
            "onContentChange"
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
