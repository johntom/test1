
'use strict'
const path = require('path')

module.exports = async function (fastify, opts) {
  console.log('Data service started...');
  // const ctx = fastify.mongo.brm.db // live
  // const casecollection = ctx.collection('case') 
  const fs = require('fs-extra')
  const io = fastify.io // socketio
  const drive = process.env.drive;
  const userdrive = process.env.userdrive;
  // console.log(userdrive)

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getEntity(database, collection) {
    // const db = fastify.mongo.db(database);
    const entity = fastify.mongo[database].db.collection(collection);
    return entity;
  }
  


//http://127.0.0.1:8080/apiSIO/hello-socketio  localhost
  fastify.get("/hello-socketio", (request, response) => {
   
    let obj={}
    obj.name ='apple pie'
    obj.rating ='4'
    obj.id =1 
    obj._id = 1
  //fastify.io.sockets. fastifyIO.socket.
  //server.io.sockets.emit('food', obj);
    console.log('b4 sockets ', obj)
    fastify.io.emit('food', obj);
    // console.log('after sockets ', obj)
    // // const app = require('fastify')();
    // // app.register(require('fastify-socket.io'));
    // // app.io.on('connection', () => { /* … */ });
    // // app.listen(3000);
  
    response.send({ you: "did it and tried sockets" });
  });

};


// WS=Websockt
module.exports.autoPrefix = '/apiSIO';