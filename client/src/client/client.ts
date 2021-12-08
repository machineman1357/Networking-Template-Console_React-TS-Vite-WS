import { clientData } from "./client-data";
import { ENetworkMessageTypes } from "./networkMessageTypes";
import { EWindowMessageTypes, IWindowMessage_consoleMessage, IWindowMessage_consoleSetConnected } from "./vars";

// import { messageFiltering_filterMessage } from "./client_messageFiltering.js";

let ws: any;
// let wsKeepAlivePingInterval: any;
// let wsKeepAlivePingIntervalRate_ms = 1000;
export let isConnectedToServer = false;

export function client_start() {
    connectToServer();
}

function connectToServer() {
    const IP = "127.0.0.1"
    const PORT = 8080;
    const webSocketIPString = 'ws://' + IP + ':' + PORT;

    window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_MESSAGE, data: { msg: "Connecting to server at " + webSocketIPString + "..." } as IWindowMessage_consoleMessage });

    ws = new WebSocket(webSocketIPString);
    console.log(ws);
    // ws.binaryType = 'arraybuffer';

    ws.onopen = function open() {
        window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_MESSAGE, data: { msg: "Connected to server!" } as IWindowMessage_consoleMessage });
        window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_SET_CONNECTED, data: { isConnected: true } as IWindowMessage_consoleSetConnected });
        ws.send('something');
        isConnectedToServer = true;
        clientData.handleOnConnected();
    };

    ws.onmessage = function message(data: any) {
        console.log('received: %s', data);
    };

    ws.onclose = function () {
        if (isConnectedToServer) {
            window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_MESSAGE, data: { msg: "Disconnected from server." } as IWindowMessage_consoleMessage });
        }
        else {
            window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_MESSAGE, data: { msg: "Failed to connect to server." } as IWindowMessage_consoleMessage });
        }

        isConnectedToServer = false;
        window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_SET_CONNECTED, data: { isConnected: false } as IWindowMessage_consoleSetConnected });
    };

    ws.onerror = function(error: any) {
        console.log('received error:', error);
    };
}

export function client_sendPayload(payload: any) {
    // ws.send(msgpack.encode(payload));
}