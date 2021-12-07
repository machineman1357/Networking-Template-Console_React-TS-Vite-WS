import { client_start } from "./client/client";
import { clientData_start } from "./client/client-data";
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
}

start();