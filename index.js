import signalR from "@microsoft/signalr";
import { getTzktData } from './libs/tzkt.js';
import { params } from "./config.js";

let level;

console.log(
`██████╗ ██╗██████╗ ██████╗ ███████╗    ███████╗██╗  ██╗    ██████╗  ██████╗ ████████╗
██╔══██╗██║██╔══██╗██╔══██╗██╔════╝    ██╔════╝╚██╗██╔╝    ██╔══██╗██╔═══██╗╚══██╔══╝
██████╔╝██║██████╔╝██████╔╝███████╗    █████╗   ╚███╔╝     ██████╔╝██║   ██║   ██║   
██╔══██╗██║██╔══██╗██╔══██╗╚════██║    ██╔══╝   ██╔██╗     ██╔══██╗██║   ██║   ██║   
██████╔╝██║██║  ██║██████╔╝███████║    ██║     ██╔╝ ██╗    ██████╔╝╚██████╔╝   ██║   
╚═════╝ ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝    ╚═╝     ╚═╝  ╚═╝    ╚═════╝  ╚═════╝    ╚═╝   
                                                                                     `);

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.tzkt.io/v1/events")
    .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (ctx) => {
            if (ctx.elapsedMilliseconds < 5000) return 1000;
            if (ctx.elapsedMilliseconds < 120000) return 10000;
            return null;
        },
    })
    .build();

async function init() {
    try {
        await connection.start();
        console.log("SignalR Connected\n");
    } catch (err) {
        console.log(err);
        setTimeout(() => init(), 5000);
    }
    await connection.invoke("SubscribeToHead")
    await connection.invoke("SubscribeToOperations", {
        address: params.fxIssuer,
        types: 'transaction'
    });
};

connection.onclose(async () => {
    console.log('********** Client Disconnected ************')
    await init();
});

connection.onreconnecting(error => {
    console.assert(connection.state === signalR.HubConnectionState.Reconnecting);
    console.log(`Connection lost due to "${error}". Attempting to reconnect...`);
});

connection.onreconnected(connectionId => {
    console.assert(connection.state === signalR.HubConnectionState.Connected);
    console.log(`Connection reestablished with connection id ${connectionId}.`);
    init();
});

connection.on("head", (msg) => {
    level = msg.data.level;
    console.log(`\n**********Block ${msg.data.level} validated**********\n`);
});

connection.on("operations", (msg) => {
    if (Object.keys(msg).length > 2) {
        console.log('Data Received from TZKT.....');
        getTzktData(msg.data, level);
    } else {
        console.log('Initializing FXhash Issuer Contract Subscription....');
    }
    
});

init();

