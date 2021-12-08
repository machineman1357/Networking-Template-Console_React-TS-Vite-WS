import { EMessageTypes } from "./console";

interface ICommandObject {
    msg: string;
    msgType: EMessageTypes;
}

function commandObject(msg: string, msgType: EMessageTypes): ICommandObject {
    return {
        msg: msg,
        msgType: msgType
    }
}

export function getCommandObj(msg: string): ICommandObject {
    const msgSplit = msg.split(" ");

    const unknownCommand = () => {
        return commandObject("Unknown command: " + msg, EMessageTypes.COMMAND);
    };

    if ((msgSplit[0] === "!name" || msgSplit[0] === "!n")) {
        if (msgSplit.length === 1) {
            return commandObject("Please fill in name parameter.", EMessageTypes.COMMAND);
        } else if (msgSplit.length === 2) {
            return commandObject(msg, EMessageTypes.SET_NAME);
        } else {
            return unknownCommand();
        }
    } else if ((msgSplit[0] === "!help" || msgSplit[0] === "!h") && msgSplit.length === 1) {
        return commandObject("", EMessageTypes.HELP);
    } else {
        return unknownCommand();
    }
}