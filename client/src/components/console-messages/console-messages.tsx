import { Component } from "react"
import style_console from "../console/console.module.css"

export class NormalConsoleMessage extends Component<{ message: string }, any> {
    render() {
        return (
            <div className={style_console.console_message}>
                <pre style={{ margin: "0", fontFamily: "system-ui" }}>
                    {this.props.message}
                </pre>
            </div>
        )
    }
}

export class PlayerConsoleMessage extends Component<{ message: string, playerName: string, colorHSL: string }, any> {
    render() {
        return (
            <div className={style_console.console_message}>
                <pre style={{ margin: "0", fontFamily: "system-ui" }}>
                    <span style={{ color: this.props.colorHSL }}>
                        {this.props.playerName}
                    </span>
                    : {this.props.message}
                </pre>
            </div>
        )
    }
}

export class HelpConsoleMessage extends Component<{ message: string }, any> {
    render() {
        return (
            <div className={style_console.console_message}>
                <pre style={{ margin: "0", fontFamily: "system-ui" }}>
                    {this.props.message}
                    <b>Commands</b>
                    <br />
                    <Tabs text={"Legend"} tabs={1} />
                    <br />
                    <Tabs text={'A command like "!command/c" means you can type "!command" and "!c" for the same behaviour.'} tabs={2} />
                    <br />
                    <Tabs text={"Commands:"} tabs={1} />
                    <br />
                    <Tabs text={"!help/h: help"} tabs={2} />
                    <br />
                    <Tabs text={"!name/n name: set name"} tabs={2} />
                </pre>
            </div>
        )
    }
}

function Tabs(props: { text: string, tabs: number }) {
    let tabs = "";
    for (let i = 0; i < props.tabs; i++) {
        for (let i = 0; i < 4; i++) {
            tabs += " ";
        }
    }
    return <span>{tabs}{props.text}</span>
}

export class SetNameConsoleMessage extends Component<{ playerName: string, colorHSL: string }, any> {
    render() {
        return (
            <div className={style_console.console_message}>
                <pre style={{ margin: "0", fontFamily: "system-ui" }}>
                    You set your name to <span style={{ color: this.props.colorHSL }}>{this.props.playerName}</span>.
                </pre>
            </div>
        )
    }
}