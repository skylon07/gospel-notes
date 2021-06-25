import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useImperativeHandle,
} from "react";
import PropTypes from "prop-types";
import "./NoteBox.css";

const NoteBox = React.forwardRef(function (props, ref) {
    // "last" meaning last submitted title/content
    const [lastTitle, setLastTitle] = useState(props.initTitle);
    const [lastContent, setLastContent] = useState(props.initContent);
    const titleRef = useRef(null);
    const contentRef = useRef(null);

    const initDims = useCallback(() => {
        const title = titleRef.current;
        if (title) {
            title.style.height = title.scrollHeight + "px";
            title.style.width = title.scrollWidth + "px";
        }

        const content = contentRef.current;
        if (content) {
            content.style.height = content.scrollHeight + "px";
            content.style.width = content.scrollWidth + "px";
        }
    }, []);
    useEffect(() => initDims(), [initDims]);

    const changeTitle = (newTitle) => {
        setLastTitle(newTitle);
        trigger(props.onTitleChange, newTitle);
    };
    const titleProps = {
        ref: titleRef,
        className: "Title",
        onBlur: () => detectChange(titleRef, lastTitle, changeTitle),
        onInput: () => resizeTextarea("title", titleRef),
        wrap: "off",
    };
    const changeContent = (newContent) => {
        setLastContent(newContent);
        trigger(props.onContentChange, newContent);
    };
    const contentProps = {
        ref: contentRef,
        className: "Content",
        onBlur: () => detectChange(contentRef, lastContent, changeContent),
        onInput: () => resizeTextarea("content", contentRef),
        wrap: "on",
    };

    useImperativeHandle(ref, () => ({
        setTitle: (newTitle, silent = false) => {
            const elem = titleRef.current;
            if (!elem || !newTitle) {
                // (un)delete textarea; must rerender
                setLastTitle(newTitle || "");
            } else {
                if (typeof newTitle !== "string") {
                    throw new TypeError(
                        `NoteBox.setTitle() must be given a string or null, not '${newTitle}'`
                    );
                }
                // set value directly to avoid rerender
                elem.value = newTitle;
            }
            if (!silent) {
                trigger(props.onTitleChange, newTitle);
            }
        },
        setContent: (newContent, silent = false) => {
            const elem = contentRef.current;
            if (!elem || !newContent) {
                // (un)delete textarea; must rerender
                setLastContent(newContent || "");
            } else {
                if (typeof newContent !== "string") {
                    throw new TypeError(
                        `NoteBox.setContent() must be given a string or null, not '${newContent}'`
                    );
                }
                // set value directly to avoid rerender
                elem.value = newContent;
            }
            if (!silent) {
                trigger(props.onContentChange, newContent);
            }
        },
    }));

    return (
        <div data-testid="note-box" className="NoteBox">
            {renderTextarea(lastTitle, titleProps, props.readOnly)}
            {renderTextarea(lastContent, contentProps, props.readOnly)}
        </div>
    );
});
NoteBox.propTypes = {
    initTitle: PropTypes.string,
    initContent: PropTypes.string,
    readOnly: PropTypes.bool,
    onTitleChange: PropTypes.func,
    onContentChange: PropTypes.func,
};
NoteBox.defaultValues = {
    initTitle: "",
    initContent: "",
    readOnly: false,
};
export default NoteBox;

function renderTextarea(initText, elemProps, readOnly) {
    if (!initText) {
        // remove the element for empty text
        return null;
    }

    if (!readOnly) {
        return (
            <textarea
                ref={elemProps.ref}
                className={elemProps.className}
                rows="1"
                cols="1"
                wrap={elemProps.wrap}
                onBlur={elemProps.onBlur}
                onInput={elemProps.onInput}
                defaultValue={initText}
            />
        );
    } else {
        return (
            <textarea
                ref={elemProps.ref}
                className={elemProps.className}
                rows="1"
                cols="1"
                wrap={elemProps.wrap}
                value={initText}
                readOnly={true}
            />
        );
    }
}

function detectChange(ref, lastValue, onChange) {
    let currValue = ref.current.value;
    // eval is used to generate the regex (because of <>); this is
    // perfectly safe usage (talking to you eslint)
    // eslint-disable-next-line no-eval
    const regex = eval("/<br>/gi");
    // convert breaks to newlines
    currValue = currValue.replace(regex, "\n");
    // ensure first/last characters are ommitted when breaks/newlines
    if (currValue[0] === "\n") {
        currValue = currValue.slice(1);
    }
    if (currValue[currValue.length - 1] === "\n") {
        currValue = currValue.slice(0, currValue.length - 1);
    }

    if (currValue !== lastValue) {
        onChange(currValue);
    }
}

// resizes a textarea element to fit it's text
function resizeTextarea(type, ref) {
    const elem = ref.current;
    if (!elem) {
        return;
    }

    elem.style.height = "auto"; // allows shrinking
    elem.style.height = elem.scrollHeight + "px";

    if (type === "title") {
        elem.wrap = "off"; // potentially temporary, to see if it is still maxed
    }
    elem.style.width = "auto";
    elem.style.width = elem.scrollWidth + "px";

    if (type === "title") {
        // the max is shrunk a bit to pad from the edge of the NoteBox
        const max = elem.parentNode.offsetWidth * 0.9 - 5;
        const isMaxed = elem.offsetWidth > max;
        if (isMaxed) {
            elem.wrap = "on";
            elem.style.width = max;
        }
    }
}

function trigger(func, ...args) {
    if (typeof func === "function") {
        func(...args);
    }
}
