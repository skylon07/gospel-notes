import React from 'react'
import './MainApp.css'

class MainApp extends React.Component {
    render() {
        return <MainWindow>
            <TextNode>
                This is the main window!
            </TextNode>
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