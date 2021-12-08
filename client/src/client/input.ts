import { EWindowMessageTypes } from "./vars";

const keyBind_toggleConsole_keyCode = "Backquote";

export function setUp_keyInputs() {
	document.addEventListener('keydown', function(ev) 	{
		if(ev.code === keyBind_toggleConsole_keyCode) {
            window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_TOGGLE, msg: "" });
		} else if(ev.code === "Enter") {
			window.postMessage({ windowMessageType: EWindowMessageTypes.CONSOLE_SEND_MESSAGE_FROM_ENTER, msg: "" });
		}
	});
}