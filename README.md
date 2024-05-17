

## Getting Started
To install all of your dependencies:

`npm install`

You will need to provide an `.env` file containing all of your MongoDB connection string information. The following is an example:


## Run
In order to run your sever locally, you can execute the following command:

`node server.js`

or 

`npm run start`



You can also use a tool like Postman to test as well.
it supports both socket.io and websocets

## socket.io [fails]
http://127.0.0.1:8080/apiSIO/hello-socketio
## error from postman
Could not connect to http://127.0.0.1:8080/apiSIO/hello-socketio
Error: Unexpected server response: 404

## error from SPA (aurelia 1.5)
// error on client
GET http://localhost:8080/socket.io/?EIO=4&transport=polling&t=OzzR0IF 404 (Not Found)
index.js:74 message xhr poll error
index.js:76 description 404
index.js:78 context XMLHttpRequest...

## error in fastify log
{"level":30,"time":1715895572624,"pid":35768,"hostname":"BGR-LT-37BG3Y2","reqId":"req-1","req":{"method":"GET","url":"/socket.io/?EIO=4&transport=websocket","hostname":"127.0.0.1:8080","remoteAddress":"127.0.0.1","remotePort":61309},"msg":"incoming request"}
{"level":30,"time":1715895572625,"pid":35768,"hostname":"BGR-LT-37BG3Y2","reqId":"req-1","msg":"Route GET:/socket.io/?EIO=4&transport=websocket not found"}


## websocket [all tests work]
### simple message
ws://127.0.0.1:8080/apiWS/hello-ws
### test multiple messages
ws://127.0.0.1:8080/apiWS/hello-ws2
### trial emultion of socket.io rooms
ws://127.0.0.1:8080/apiWS/ws-room/r101


## Additional thoughts

socket.io works with fastify 3 
"fastify": "^3.29.0",
"@guivic/fastify-socket.io": "^0.1.3"



