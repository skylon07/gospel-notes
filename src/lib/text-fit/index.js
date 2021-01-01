/* Best Fit
This is a small library that was built to provide help with
fitting text into HTML elements.
*/

import React from 'react'
import './styles.css'

// a basic node that will resize its text to fit its parent
export class TextNode extends React.Component {
    render() {
        // NOTE: children should be a raw string of text
        return <div className="TextNode">
            {this.props.children}
        </div>
    }
}