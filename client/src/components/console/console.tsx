import { Component, createRef } from "react";
import { client_sendPayload, isConnectedToServer } from "../../client/client";
import { clientData } from "../../client/client-data";
import { ENetworkMessageTypes } from "../../client/networkMessageTypes";
import { EWindowMessageTypes } from "../../client/vars";
import { getPlayerColorHSL } from "../../utilities/utilities";
import { HelpConsoleMessage, NormalConsoleMessage, PlayerConsoleMessage, SetNameConsoleMessage } from "../console-messages/console-messages";

import consoleStyles from "./console.module.css";
import prettyLineStyles from "./pretty-line.module.css";
import scrollbarStyles from "./scrollbar.module.css";

/*
function setEvents() {
    ref_console_sendMessageButton.onclick = sendMessage;
    ref_console_messages_container.onscroll = onMessagesScroll;
}

function setRefs() {
    ref_console_container = document.querySelector("#console_container");
    ref_console_messages_container = document.querySelector("#console_messages_container");
    ref_console_messagesFade_top = document.querySelector("#console_messagesFade_top");
    ref_console_messagesFade_bottom = document.querySelector("#console_messagesFade_bottom");
    ref_console_messages = document.querySelector("#console_messages");
    ref_console_inputBox_container = document.querySelector("#console_inputBox_container");
    ref_console_messageInput = document.querySelector("#console_messageInput");
    ref_console_sendMessageButton = document.querySelector("#console_sendMessageButton");
}

export function console_toggle() {
    if (isConsoleOpen) {
        closeConsole();
    } else {
        openConsole();
    }

    isConsoleOpen = !isConsoleOpen;
}

export function onEnterPressed() {
    if (document.activeElement === ref_console_messageInput) {
        sendMessage();
    } else {
        if (isConsoleOpen) {
            ref_console_messageInput.focus();
        }
    }
}

function closeConsole() {
    ref_console_container.classList.remove("console_container_fadeIn");

    unFocusInput();
}

function openConsole() {
    ref_console_container.classList.add("console_container_fadeIn");
    ref_console_messagesFade_top.style.background = "#000000b3";
}

function unFocusInput() {
    var tmp = document.createElement("input");
    document.body.appendChild(tmp);
    tmp.focus();
    document.body.removeChild(tmp);
}
*/

enum EMessageType {
    "NORMAL",
    "PLAYER",
    "HELP",
    "SET_NAME",
    "COMMAND",
}

interface IConsoleState {
    messages: Array<{ msgType: EMessageType, msg: string, playerName: string, colorHSL: string }>,
    isDisabled_bottomMessagesFade: boolean
}

export class Console extends Component<{}, IConsoleState> {
    public ref_messageInput: React.RefObject<HTMLInputElement> = createRef();
    public ref_consoleMessages: React.RefObject<HTMLDivElement> = createRef();
    public ref_messagesContainer: React.RefObject<HTMLDivElement> = createRef();
    public ref_messagesFade_bottom: React.RefObject<HTMLDivElement> = createRef();

    public backLoggedMessages: Array<string> = [];
    public _ismounted = false;

    constructor(props: any) {
        super(props);

        this.state = {
            messages: [],
            isDisabled_bottomMessagesFade: true
        };

        window.addEventListener('message', (event) => {
            this.onOutsideMessage(event.data);
        });
    }

    componentDidMount() {
        this._ismounted = true;

        for (let i = 0; i < this.backLoggedMessages.length; i++) {
            const backLoggedMessage = this.backLoggedMessages[i];
            console.log("adding backlogged message:", backLoggedMessage);
            this.addMessage(backLoggedMessage, EMessageType.NORMAL, "", "");
        }
    }

    componentDidUpdate() {
        if(this.ref_messagesContainer.current && this.ref_consoleMessages.current) {
            // this.ref_messagesContainer.current.scrollTop = this.ref_consoleMessages.current.scrollHeight;
        }
    }

    onMessagesScroll() {
        if(!this.ref_messagesContainer.current) return;

        const messagesContainer_rect = this.ref_messagesContainer.current.getBoundingClientRect();
        const scrollbarEnd = Math.round(this.ref_messagesContainer.current.scrollTop + messagesContainer_rect.height);
    
        if (scrollbarEnd >= this.ref_messagesContainer.current.scrollHeight - 5) { // add a bit of "padding" in case values are ex.: 544 scrollEnd and 545 scrollHeight
            this.setState({ isDisabled_bottomMessagesFade: true });
        } else {
            this.setState({ isDisabled_bottomMessagesFade: false });
        }
    
        if (this.ref_messagesContainer.current.scrollTop === 0) {
            this.setState({ isDisabled_bottomMessagesFade: true });
        } else {
            this.setState({ isDisabled_bottomMessagesFade: false });
        }
    }

    attempt_sendMessageOnNetwork(msg: any) {
        if (!isConnectedToServer) {
            this.addMessage("Cannot send message over network: not connected to server.", EMessageType.NORMAL, "", "");

            return;
        }

        const playerName = clientData.playerName;
        const playerColorDegree = clientData.playerColorDegree;

        const payload_msgBoxMsg = [
            ENetworkMessageTypes.MESSAGE_BOX_MESSAGE,
            playerName,
            playerColorDegree,
            msg
        ];
        client_sendPayload(payload_msgBoxMsg);
    }

    onOutsideMessage(data: { windowMessageType: EWindowMessageTypes, msg: string }) {
        if (data.windowMessageType !== undefined && data.windowMessageType === EWindowMessageTypes.CONSOLE_MESSAGE) {
            if (this._ismounted) {
                this.addMessage(data.msg, EMessageType.NORMAL, "", "");
            } else {
                this.backLoggedMessages.push(data.msg);
            }
        }
    }

    addMessage(msg: string, msgType: EMessageType, playerName: string, colorHSL: string) {
        let messageEntry = {
            msgType: msgType,
            msg: msg,
            playerName: playerName,
            colorHSL: colorHSL
        };

        this.setState((state: any) => {
            // Important: read `state` instead of `this.state` when updating.
            return { messages: state.messages.concat(messageEntry) }
        });
    }

    doCommand_setPlayerName(msg: string) {
        if (!isConnectedToServer) {
            this.addMessage("Cannot set name: not connected to server.", EMessageType.COMMAND, "", "");

            return;
        }

        const msgSplit = msg.split(" ");

        const playerName = msgSplit[1];
        const playerColorDegree = Math.floor(Math.random() * 360);

        clientData.setPlayerNameAndColor(playerName, playerColorDegree);

        const playerColorHSL = getPlayerColorHSL(playerColorDegree);
        this.addMessage("", EMessageType.SET_NAME, clientData.playerName, playerColorHSL);

        const payload_setPlayerName = [
            ENetworkMessageTypes.SET_PLAYER_NAME,
            clientData.playerName,
            playerColorDegree
        ];
        client_sendPayload(payload_setPlayerName);
    }

    checkWhichCommandToDo(msg: string) {
        const msgSplit = msg.split(" ");

        this.addMessage(msg, EMessageType.NORMAL, "", "");

        if ((msgSplit[0] === "!name" || msgSplit[0] === "!n")) {
            if (msgSplit.length === 1) {
                this.addMessage("Please fill in name parameter.", EMessageType.COMMAND, "", "");
            } else if (msgSplit.length === 2) {
                this.doCommand_setPlayerName(msg);
            } else {
                this.addMessage("Unknown command: " + msg, EMessageType.COMMAND, "", "");
            }
        } else if ((msgSplit[0] === "!help" || msgSplit[0] === "!h") && msgSplit.length === 1) {
            this.addMessage("", EMessageType.HELP, "", "");
        } else {
            this.addMessage("Unknown command: " + msg, EMessageType.COMMAND, "", "");
        }
    }

    sendMessage() {
        if(!this.ref_messageInput.current) return;

        const message = this.ref_messageInput.current.value;

        if (message[0] === "!") {
            this.checkWhichCommandToDo(message);
        } else {
            const playerName = clientData.playerName;
            const playerColorDegree = clientData.playerColorDegree;

            const playerColorHSL = getPlayerColorHSL(playerColorDegree);
            this.addMessage(message, EMessageType.PLAYER, playerName, playerColorHSL);

            this.attempt_sendMessageOnNetwork(message);
        }

        this.ref_messageInput.current.value = "";
    }

    render() {
        const messagesFade_bottom_style = this.state.isDisabled_bottomMessagesFade ? consoleStyles.console_messagesFade_disabled : undefined;

        return (
            <div className={consoleStyles.console_container}>
                <div className={consoleStyles.console_bg}></div>
                <div className={consoleStyles.console_dropShadow}></div>
                <div className={consoleStyles.console_messagesAndSendButton_container}>
                    <div className={consoleStyles.console_messagesAndInputBox_container}>
                        <div className={consoleStyles.console_titleAndDescriptionAndMessagesContainer}>
                            <div className={consoleStyles.console_title}>Console</div>
                            <div className={consoleStyles.console_description}>Messages and commands. Press enter to message.</div>
                            <div ref={this.ref_messagesContainer} className={consoleStyles.console_messageBox_container}>
                                <div className={`${consoleStyles.console_messagesFade_top} ${consoleStyles.console_messagesFade} ${consoleStyles.console_messagesFade_disabled}`} style={{ top: "-60px" }}></div>
                                <div ref={this.ref_consoleMessages} className={`${consoleStyles.console_messages_container} ${scrollbarStyles.scrollbar}`}>
                                    <div className={consoleStyles.console_messages}>
                                        {this.state.messages.map((msg, i) => {
                                            if (msg.msgType === EMessageType.NORMAL) {
                                                return <NormalConsoleMessage key={i} message={msg.msg} />
                                            } else if (msg.msgType === EMessageType.PLAYER) {
                                                return <PlayerConsoleMessage key={i} message={msg.msg} playerName={msg.playerName} colorHSL={msg.colorHSL} />
                                            } else if (msg.msgType === EMessageType.HELP) {
                                                return <HelpConsoleMessage key={i} message={msg.msg} />
                                            } else if (msg.msgType === EMessageType.SET_NAME) {
                                                return <SetNameConsoleMessage key={i} playerName={msg.playerName} colorHSL={msg.colorHSL} />
                                            } else if (msg.msgType === EMessageType.COMMAND) {
                                                return <NormalConsoleMessage key={i} message={msg.msg} />
                                            }
                                        })}
                                    </div>
                                </div>
                                <div ref={this.ref_messagesFade_bottom} className={`${consoleStyles.console_messagesFade} ${messagesFade_bottom_style}`} style={{ bottom: "-60px" }}></div>
                            </div>
                        </div>
                        <div className={consoleStyles.console_inputBox_container}>
                            <input type="text" className={consoleStyles.console_messageInput} ref={this.ref_messageInput} />
                        </div>
                        <div className={prettyLineStyles.prettyLine_filled}></div>
                    </div>
                    <div className={consoleStyles.console_sendButtonAndPrettyLine_container}>
                        <div className={prettyLineStyles.prettyLine_fade}></div>
                        <div className={consoleStyles.console_sendMessageButton} onClick={this.sendMessage.bind(this)}>SEND
                            <span className={`material-icons-outlined ${consoleStyles.console_button_materialFont}`}>
                                chevron_right
                            </span>
                        </div>
                    </div>
                </div>
                <div className={consoleStyles.console_topGlow}></div>
            </div>
        )
    }
}