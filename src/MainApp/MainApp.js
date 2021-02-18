import React from 'react'
import './MainApp.css'

import { StaticTextNode } from "lib/text-fit"
import { SVGIcon } from 'lib/svg-icon'

class MainApp extends React.Component {
    render() {
        return <MainWindow>
            <StaticTextNode>
                This is the main window!
            </StaticTextNode>
        </MainWindow>
    }
}

// a container that holds any settings/data pertaining to the window
class MainWindow extends React.Component {
    render() {
        return <div className="MainWindow">
            {this.props.children}
        </div>
    }
}

export default MainApp