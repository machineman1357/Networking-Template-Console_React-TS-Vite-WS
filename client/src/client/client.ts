import { ENetworkMessageTypes } from "./networkMessageTypes";
import { EWindowMessageTypes } from "./vars";

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

    window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_MESSAGE, msg: "Connecting to server at " + webSocketIPString + "..." });

    ws = new WebSocket(webSocketIPString);
    console.log(ws);
    // ws.binaryType = 'arraybuffer';

    ws.onopen = function open() {
        window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_MESSAGE, msg: "Connected to server!" });
        ws.send('something');
        isConnectedToServer = true;
    };

    ws.onmessage = function message(data: any) {
        console.log('received: %s', data);
    };

    ws.onclose = function () {
        if (isConnectedToServer) {
            window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_MESSAGE, msg: "Disconnected from server." });
        }
        else {
            window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_MESSAGE, msg: "Failed to connect to server." });
        }

        isConnectedToServer = false;
    };

    ws.onerror = function(error: any) {
        console.log('received error:', error);
    };
}

export function client_sendPayload(payload: any) {
    // ws.send(msgpack.encode(payload));
}