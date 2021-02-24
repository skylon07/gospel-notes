import React from 'react'
import './MainApp.css'

import { StaticTextNode } from "lib/text-fit"
import { SVGIcon } from 'lib/svg-icon'

import { TopBar } from 'navigation'
import { DropBar, NoteBox, DropBarGroup } from 'noteboard'

class MainApp extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            forceMenuHidden: null,
        }
    }
    render() {
        return <MainWindow>
            <TopBar
                menuContent={this.renderMenu()}
                forceMenuHidden={this.state.forceMenuHidden}
            />
        </MainWindow>
    }

    renderMenu() {
        return <button onClick={() => this.hideMenu()}>
            Close Menu
        </button>
    }

    hideMenu() {
        this.setState({ forceMenuHidden: true }, () => {
            this.setState({ forceMenuHidden: null })
        })
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