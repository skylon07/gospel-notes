import React from "react";
import "./BetaDisclaimer.css";

export default class BetaDisclaimer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showing: true,
            fading: false,
        };
    }

    render() {
        return (
            <div
                className="BetaDisclaimer"
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
        );
    }

    makeStyle() {
        if (!this.state.showing) {
            if (this.state.fading) {
                return { animationName: "BetaDisclaimer_fadeOut" };
            } else {
                return { display: "none" };
            }
        }
        return {};
    }

    fade() {
        this.setState({ showing: false, fading: true });
    }

    afterFade() {
        this.setState({ showing: false, fading: false });
    }
}
