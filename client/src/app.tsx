import { client_start } from "./client/client";
import { clientData_start } from "./client/client-data";
import { setUp_keyInputs } from "./client/input";
import { Console } from "./components/console/console";

export function App() {
    return (
        <>
            <Console />
        </>
    )
}

function start() {
    clientData_start();
    client_start();
    setUp_keyInputs();
}

start();