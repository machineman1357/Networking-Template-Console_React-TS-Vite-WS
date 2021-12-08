import { Component, createRef } from "react";
import { client_sendPayload, isConnectedToServer } from "../../client/client";
import { clientData } from "../../client/client-data";
import { ENetworkMessageTypes } from "../../client/networkMessageTypes";
import { EWindowMessageTypes } from "../../client/vars";
import { getPlayerColorHSL } from "../../utilities/utilities";
import { HelpConsoleMessage, NormalConsoleMessage, PlayerConsoleMessage, SetNameConsoleMessage } from "../console-messages/console-messages";
import { getCommandObj } from "./commands";

import consoleStyles from "./console.module.css";
import prettyLineStyles from "./pretty-line.module.css";
import scrollbarStyles from "./scrollbar.module.css";

export enum EMessageTypes {
    "NONE",
    "NORMAL",
    "PLAYER",
    "HELP",
    "SET_NAME",
    "COMMAND",
}

interface IConsoleState {
    messages: Array<{ msgType: EMessageTypes, msg: string, playerName: string, colorHSL: string }>;
    isDisabled_topMessagesFade: boolean;
    isDisabled_bottomMessagesFade: boolean;
    isConsoleOpen: boolean;
}

export class Console extends Component<{}, IConsoleState> {
    public ref_consoleContainer: React.RefObject<HTMLInputElement> = createRef();
    public ref_messageInput: React.RefObject<HTMLInputElement> = createRef();
    public ref_consoleMessages: React.RefObject<HTMLDivElement> = createRef();
    public ref_messagesContainer: React.RefObject<HTMLDivElement> = createRef();
    public ref_messagesFade_top: React.RefObject<HTMLDivElement> = createRef();
    public ref_messagesFade_bottom: React.RefObject<HTMLDivElement> = createRef();

    public backLoggedMessages: Array<string> = [];
    public _ismounted = false;

    constructor(props: any) {
        super(props);

        this.state = {
            messages: [],
            isDisabled_topMessagesFade: true,
            isDisabled_bottomMessagesFade: true,
            isConsoleOpen: false
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
            this.addMessage(backLoggedMessage, EMessageTypes.NORMAL, "", "");
        }
    }

    console_toggle() {
        if(!this._ismounted) return;

        if (this.state.isConsoleOpen) {
            this.setState({ isConsoleOpen: false });
        } else {
            this.setState({ isConsoleOpen: true });
        }
    }

    onEnterPressed() {
        if (document.activeElement === this.ref_messageInput.current) {
            this.sendMessage();
        } else {
            if (this.state.isConsoleOpen && this.ref_messageInput.current) {
                this.ref_messageInput.current.focus();
            }
        }
    }

    onMessagesScroll = (event: any) => {
        if(!this.ref_messagesContainer.current) return;

        const messagesContainer_rect = this.ref_messagesContainer.current.getBoundingClientRect();
        const scrollbarEnd = Math.round(this.ref_messagesContainer.current.scrollTop + messagesContainer_rect.height);
    
        if (scrollbarEnd >= this.ref_messagesContainer.current.scrollHeight) { // add a bit of "padding" in case values are ex.: 544 scrollEnd and 545 scrollHeight
            this.setState({ isDisabled_bottomMessagesFade: true });
        } else {
            this.setState({ isDisabled_bottomMessagesFade: false });
        }
    
        if (this.ref_messagesContainer.current.scrollTop === 0) {
            this.setState({ isDisabled_topMessagesFade: true });
        } else {
            this.setState({ isDisabled_topMessagesFade: false });
        }
    }

    attempt_sendMessageOnNetwork(msg: any) {
        if (!isConnectedToServer) {
            this.addMessage("Cannot send message over network: not connected to server.", EMessageTypes.NORMAL, "", "");

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
        if (data.windowMessageType !== undefined) {
            if(data.windowMessageType === EWindowMessageTypes.CONSOLE_MESSAGE) {
                if (this._ismounted) {
                    this.addMessage(data.msg, EMessageTypes.NORMAL, "", "");
                } else {
                    this.backLoggedMessages.push(data.msg);
                }
            } else if(data.windowMessageType === EWindowMessageTypes.CONSOLE_TOGGLE) {
                this.console_toggle();
            } else if(data.windowMessageType === EWindowMessageTypes.CONSOLE_SEND_MESSAGE_FROM_ENTER) {
                this.onEnterPressed();
            }
        }
    }

    addMessage(msg: string, msgType: EMessageTypes, playerName: string, colorHSL: string) {
        let messageEntry = {
            msgType: msgType,
            msg: msg,
            playerName: playerName,
            colorHSL: colorHSL
        };

        this.setState((state: any) => {
            // Important: read `state` instead of `this.state` when updating.
            return { messages: state.messages.concat(messageEntry) }
        }, () => {
            if(this.ref_messagesContainer.current && this.ref_consoleMessages.current) {
                this.ref_messagesContainer.current.scrollTop = this.ref_consoleMessages.current.scrollHeight;
            }
        });
    }

    doCommand_setPlayerName(msg: string) {
        if (!isConnectedToServer) {
            this.addMessage("Cannot set name: not connected to server.", EMessageTypes.COMMAND, "", "");

            return;
        }

        const msgSplit = msg.split(" ");

        const playerName = msgSplit[1];
        const playerColorDegree = Math.floor(Math.random() * 360);

        clientData.setPlayerNameAndColor(playerName, playerColorDegree);

        const playerColorHSL = getPlayerColorHSL(playerColorDegree);
        this.addMessage("", EMessageTypes.SET_NAME, clientData.playerName, playerColorHSL);

        const payload_setPlayerName = [
            ENetworkMessageTypes.SET_PLAYER_NAME,
            clientData.playerName,
            playerColorDegree
        ];
        client_sendPayload(payload_setPlayerName);
    }

    checkWhichCommandToDo(msg: string) {
        this.addMessage(msg, EMessageTypes.NORMAL, "", "");

        const commandObj = getCommandObj(msg);
        
        if(commandObj.msgType === EMessageTypes.SET_NAME) {
            this.doCommand_setPlayerName(commandObj.msg);
        } else {
            this.addMessage(commandObj.msg, commandObj.msgType, "", "");
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
            this.addMessage(message, EMessageTypes.PLAYER, playerName, playerColorHSL);

            this.attempt_sendMessageOnNetwork(message);
        }

        this.ref_messageInput.current.value = "";
        this.ref_messageInput.current.blur();
    }

    render() {
        const consoleContainer_class = this.state.isConsoleOpen ? consoleStyles.console_container_fadeIn : undefined;
        const messagesFade_top_class = this.state.isDisabled_topMessagesFade ? consoleStyles.console_messagesFade_disabled : undefined;
        const messagesFade_bottom_class = this.state.isDisabled_bottomMessagesFade ? consoleStyles.console_messagesFade_disabled : undefined;

        return (
            <div ref={this.ref_consoleContainer} className={`${consoleStyles.console_container} ${consoleContainer_class}`}>
                <div className={consoleStyles.console_bg}></div>
                <div className={consoleStyles.console_dropShadow}></div>
                <div className={consoleStyles.console_messagesAndSendButton_container}>
                    <div className={consoleStyles.console_messagesAndInputBox_container}>
                        <div className={consoleStyles.console_titleAndDescriptionAndMessagesContainer}>
                            <div className={consoleStyles.console_title}>Console</div>
                            <div className={consoleStyles.console_description}>Messages and commands. Press enter to message.</div>
                            <div className={consoleStyles.console_messageBox_container}>
                                <div ref={this.ref_messagesFade_top} className={`${consoleStyles.console_messagesFade_top} ${consoleStyles.console_messagesFade}  ${messagesFade_top_class}`} style={{ top: "-60px" }}></div>
                                <div ref={this.ref_messagesContainer} className={`${consoleStyles.console_messages_container} ${scrollbarStyles.scrollbar}`} onScroll={this.onMessagesScroll}>
                                    <div ref={this.ref_consoleMessages} className={consoleStyles.console_messages}>
                                        {this.state.messages.map((msg, i) => {
                                            if (msg.msgType === EMessageTypes.NORMAL) {
                                                return <NormalConsoleMessage key={i} message={msg.msg} />
                                            } else if (msg.msgType === EMessageTypes.PLAYER) {
                                                return <PlayerConsoleMessage key={i} message={msg.msg} playerName={msg.playerName} colorHSL={msg.colorHSL} />
                                            } else if (msg.msgType === EMessageTypes.HELP) {
                                                return <HelpConsoleMessage key={i} message={msg.msg} />
                                            } else if (msg.msgType === EMessageTypes.SET_NAME) {
                                                return <SetNameConsoleMessage key={i} playerName={msg.playerName} colorHSL={msg.colorHSL} />
                                            } else if (msg.msgType === EMessageTypes.COMMAND) {
                                                return <NormalConsoleMessage key={i} message={msg.msg} />
                                            }
                                        })}
                                    </div>
                                </div>
                                <div ref={this.ref_messagesFade_bottom} className={`${consoleStyles.console_messagesFade} ${messagesFade_bottom_class}`} style={{ bottom: "-60px" }}></div>
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