// // // see server.js
// //
// //
// //
// // MUST "path": "../node_modules/socket.io-client211/dist" for client
// // MUST "socket.io": "^2.2.0"" for server  npm i socket.io@"^2.2.0"
// //

'use strict'
const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {



  fastify.register(require('fastify-socket.io'), {
  
      //    cors: {
      //   origin: "http://localhost:8080",
      // //  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      // },
});

console.log('fastify-plugin.socket.io connect');
fastify.ready(err => {
  if (err) {
      console.error('Error while starting Fastify:', err);
  }
  fastify.io.on('connection', () => {
      console.log('connection established')
  })
})

// await fastify.ready(async err => {
//  if (err) throw err;
//  console.log('before connect')//, fastify.io);
//  fastify.io.on('connect', (socket) => {
//    console.log('fastify.connect');//, socket);
//  })
// });
});
