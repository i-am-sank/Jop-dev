const http = require('http');
const Websocket = require('ws');
const User = require('./User.js');

const server = http.createServer();
const wss = new Websocket.Server({ noServer: true});

clients = [];
newuserClients = [];


function pushToClients(senderUid, msg, collabs) {
	collabs.forEach(function (client) {
        	if ( senderUid != client.uid ) { 
			client.ws.send(JSON.stringify(msg));  
		};
    	});
	console.log('websocket out',msg);
}

wss.on('connnection', (ws, req, clientUid) => {
    const user = User.getUserById(clientUid);


    ws.on('message', user.listener);
    ws.on('close', () => console.log('disconnected'));

})

server.on('upgrade', (request, socket, head) => {

    const getCredentials = request.headers['sec-websocket-protocol'];
    if(getCredentials){
        const credentials = JSON.parse(getCredentials);
        if(credentials.request){
            credentials.ip = request.socket.remoteAddress;
        }
        else{
            console.log('failed attempt');
        }
    }
})

server.listen(8080);