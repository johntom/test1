

'use strict'
const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {

    fastify.register(require('@fastify/websocket'))


  // Require fastify-socket.io and register it as any other plugin, it will add a io decorator.
//   fastify.register(require('fastify-socket.io'), {
//     // cors:{  origin: "http://127.0.0.1:8080",  methods: ["GET", "POST"] }
//   });



//   fastify.ready(async err => {
//     if (err) throw err;
//     //console.log('fastify.connected',fastify.io);
//     fastify.io.on('connect', (socket) => {
//       console.log('fastify-websocket.connect');//, socket);
//     })

//     fastify.io.on('connection', (socket) => {
//       console.log('fastify-websocket.connection');//, socket);
//     })
//     fastify.io.on('disconnect', (reason) => {
//       console.log('fastify-websocket.disconnect', reason);
//     })
//   });


});

