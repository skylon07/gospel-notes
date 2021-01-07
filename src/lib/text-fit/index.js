/* Best Fit
This is a small library that was built to provide help with
fitting text into HTML elements.
*/

import React from 'react'
import './styles.css'

// a basic node that will resize its text to fit its parent
export class TextNode extends React.Component {
    constructor(props) {
        super(props)

        // refs used for detecting width/height targets and setting font sizes
        this.selfRef = React.createRef()
        this.textRef = React.createRef()
    }

    render() {
        // NOTE: children should be a raw string of text
        return <div ref={this.selfRef} className="TextNode">
            <div ref={this.textRef} className="textSizer">
                {this.props.children}
            </div>
        </div>
    }

    componentDidMount() {
        const self = this.selfRef.current
        let lastWidth, lastHeight // undefined !== number; runs update on first frame
        // records this._interval for unmount; do not rely on this value existing!
        const intervalFunc = () => this._interval = requestAnimationFrame(() => {
           if (lastWidth !== self.clientWidth || lastHeight !== self.clientHeight) {
                this._updateTextSize()
                lastWidth = self.clientWidth
                lastHeight = self.clientHeight
            }

            intervalFunc()
        })
        intervalFunc()
    }

    componentWillUnmount() {
        cancelAnimationFrame(this._interval)
    }

    _updateTextSize() {
        const selfElem = this.selfRef.current
        const maxWidth = selfElem.clientWidth
        // NOTE: height is also used to allow wrapping text
        const maxHeight = selfElem.clientHeight

        // NOTE: the default algorithm is recorded in the "NoWrap" version;
        // an interesting problem arises with wrapping... (see "Wrap" version)
        const text = this.props.children
        const willBreak = text.includes(' ') // TODO: do more extensive "will break" testing (commas? tabs?)
        if (typeof text === "string" && willBreak) {
            this._updateTextSizeWrap(maxWidth, maxHeight)
        }
        else {
            this._updateTextSizeNoWrap(maxWidth, maxHeight)
        }
    }

    // the default, "NoWrap" version of the updating algorithm (ie single word text)
    _updateTextSizeNoWrap(maxWidth, maxHeight) {
        // we want to always start at zero (this avoids any potential syncing issues with relative changes)
        let currDims = this._setFontSize(0)
        // NOTE: this updates in increments of 144, 29, 6, and 1 as a searching optimization
        // (these numbers were chosen based on this logic:
        //   - we want to add 1 a max of 5 times; 6's moduar range is 5 (6 % x == 5 at highest)
        //   - we want to add 6 a max of 5 times; 6 * 5 - 1 (29) has a modular range of 5 (when counting by 6)
        //   - we want to add 29 a max of 5 times; 29 * 5 - 1 (144) meets the same criteria
        //   - most use cases won't need a font size above 1000px (having 'as' size to fullscreen was ~800px at 1080p);
        //     this ensures we won't be changing by 144 more than 6-7 times, which (adding all worst-cases)
        //     ensures we will not be iterating/resizing more than 22 times
        // )
        while (currDims.width < maxWidth && currDims.height < maxHeight) {
            currDims = this._setFontSize(currDims.fontSize + 144)
        }

        // operators reversed since width/height is now larger than target
        while (currDims.width > maxWidth || currDims.height > maxHeight) {
            currDims = this._setFontSize(currDims.fontSize - 29)
        }

        // reversed again for the same reason
        while (currDims.width < maxWidth && currDims.height < maxHeight) {
            currDims = this._setFontSize(currDims.fontSize + 6)
        }

        // having an even number of loops ensures we end up underneath target/max value
        while (currDims.width > maxWidth || currDims.height > maxHeight) {
            currDims = this._setFontSize(currDims.fontSize - 1)
        }
    }

    // the alternate, "Wrap" version of the updating algorithm (ie multiple word text)
    _updateTextSizeWrap(maxWidth, maxHeight) {
        let currDims = this._setFontSize(0)
        while (currDims.width < maxWidth && currDims.height < maxHeight) {
            currDims = this._setFontSize(currDims.fontSize + 144)
        }
        // NOTE: since wrapping text trades width for height, sometimes (when the width
        // is greater than the height) an element will wrap text without trading all the
        // width it can; therefore, to maximize height, we just go another step and see
        // if the width changes, and only stop when it does
        let lastWidth = currDims.width
        while (lastWidth === currDims.width && currDims.height < maxHeight) {
            currDims = this._setFontSize(currDims.fontSize + 144)
        }

        while (currDims.width > maxWidth || currDims.height > maxHeight) {
            currDims = this._setFontSize(currDims.fontSize - 29)
        }

        while (currDims.width < maxWidth && currDims.height < maxHeight) {
            currDims = this._setFontSize(currDims.fontSize + 6)
        }
        // extra comparison is also added here
        lastWidth = currDims.width
        while (lastWidth === currDims.width && currDims.height < maxHeight) {
            currDims = this._setFontSize(currDims.fontSize + 6)
        }

        while (currDims.width > maxWidth || currDims.height > maxHeight) {
            currDims = this._setFontSize(currDims.fontSize - 1)
        }
    }

    _setFontSize(size) {
        if (size < 0) {
            size = 0 // don't want any CSS errors with negative font sizes!
        }

        const textElem = this.textRef.current
        textElem.style['font-size'] = `${size}px`

        return { fontSize: size, width: textElem.clientWidth, height: textElem.clientHeight }
    }
}
