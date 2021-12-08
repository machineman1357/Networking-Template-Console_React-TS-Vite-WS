export enum EWindowMessageTypes {
    "CONSOLE_MESSAGE",
    "CONSOLE_TOGGLE",
    "CONSOLE_SEND_MESSAGE_FROM_ENTER",
    "CONSOLE_SET_CONNECTED"
}

export interface IWindowMessage_consoleSetConnected {
    isConnected: boolean
}

export interface IWindowMessage_consoleMessage {
    msg: string
}