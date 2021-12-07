export let clientData: ClientData;

export function clientData_start() {
	clientData_create();
}

function clientData_create() {
	clientData = new ClientData();
}

class ClientData {
    public socketID: number = -1;
    public playerName: string = "OFFLINE_DUDE";
    public playerColorDegree: number = -1;

	constructor() {
		
	}

	setSocketID(socketID: number) {
		this.socketID = socketID;

		this.setPlayerNameAndColor("socket_" + this.socketID, -1);
	}

	setPlayerNameAndColor(playerName: string, playerColorDegree: number = -1) {
		if(playerName === "") {
			this.playerName = "anonskt_" + this.socketID;
		}
		else {
			this.playerName = playerName;
		}

		this.playerColorDegree = playerColorDegree;
	}
}