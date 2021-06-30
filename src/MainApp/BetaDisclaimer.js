import React from "react"
import "./BetaDisclaimer.css"

export default class BetaDisclaimer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showing: true,
            fading: false,
        }
    }

    render() {
        return (
            <div
                className="BetaDisclaimer"
                aria-label="disclaimer"
                role="alert"
                style={this.makeStyle()}
                onAnimationEnd={() => this.afterFade()}
            >
                <h1 className="Warning">WARNING!!!</h1>
                <h3 className="Message">
                    This app is currently under development and is subject to
                    change. You may use the features currently provided, but
                    there is no guarantee they will always work properly. Should
                    you choose to store notes here, please have a backup, as
                    future changes will likely cause data loss.
                </h3>
                <button onClick={() => this.fade()}>Continue anyway</button>
            </div>
        )
    }

    // using state to control animations/direct styles on elements is
    // highly discouraged; it is inefficient and hard to read. This
    // should be changed, however since this is a temporary component
    // that will be deleted in the near future, it likely will not be.
    makeStyle() {
        if (!this.state.showing) {
            if (this.state.fading) {
                return { animationName: "BetaDisclaimer_fadeOut" }
            } else {
                return { display: "none" }
            }
        }
        return {}
    }

    fade() {
        this.setState({ showing: false, fading: true })
    }

    afterFade() {
        this.setState({ showing: false, fading: false })
    }
}
