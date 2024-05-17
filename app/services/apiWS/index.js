
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
  //
  // getProp
  // Reference: https://gist.github.com/harish2704/d0ee530e6ee75bad6fd30c98e5ad9dab
  // Usage: "pipeline[0].$match.modified_date.$gt"
  //
  function getProp(object, keys, defaultVal) {
    keys = Array.isArray(keys) ? keys : keys.replace(/(\[(\d)\])/g, '.$2').split('.');
    object = object[keys[0]];
    if (object && keys.length > 1) {
      return getProp(object, keys.slice(1), defaultVal);
    }
    return object === undefined ? defaultVal : object;
  }

  function reviver_reviver(key, value) {
    if (typeof value === 'string') {
      if (/\d{4}-\d{1,2}-\d{1,2}/.test(value) ||
        /\d{4}\/\d{1,2}\/\d{1,2}/.test(value)) {
        return new Date(value);
      } else if (key === '_id') {
        return require('mongodb').ObjectId(value);
      }
    }
    return value;
  }
  function reviver(key, value) {
    if (typeof value === 'string') {

      if (/\d{4}-\d{1,2}-\d{1,2}/.test(value) ||
        /\d{4}\/\d{1,2}\/\d{1,2}/.test(value)) {
        return new Date(value);
      } else if (key === '_id') {
        return require('mongodb').ObjectId(value);
      } else if (key === 'file') {
        //pdf names have a timestap
        return value;
      }
    }
    return value;
  }


  // localhost:8080/apiWS/hello-wsx
  fastify.get('/hello-wsx', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
      connection.socket.send('Hello Fastify WebSockets');
    });
  });


  // localhost:8080/apiWS/hello-ws
  //  fastify.get('/another/path', function (req, reply) {
  fastify.get('/static1', function (req, reply) {
    reply.sendFile('myHtml.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
  })

  // localhost:8080/apiWS/test
  fastify.get('/test', function (req, reply) {
    fastify.inject({
      method: 'get',

      url: `ws:localhost:8080/apiWS/hello-ws`
    }, (err, response) => {
      if (err) {
        next(err)
      } else {

      }
    })
  })

  fastify.get('/ws-room/:room', { websocket: true },
  async (connection, req) => {
    const {  room } = req.params;
    let message = undefined;
    connection.socket.on('message', message => {
      if( room==='r101'){
      connection.socket.send(`Hello Fastify WebSockets apiWS/ws-room ${room}  ${message} `);
      } else {
        connection.socket.send(`Hello Fastify WebSockets apiWS/no room ${message} `);
        
      }
    });
    if (message === undefined) {
      // let mySet = new Set([{ item: 'SomeItem', selected: true }]);
      // let itemA = "SomeItem";
      let client1 = Array.from(fastify.websocketServer.clients)[0]
      // .some(element => element.item === itemA);
      if (client1.readyState === 1) client1.send(`connected to websocket ${room} `)
      // for (let client of fastify.websocketServer.clients) {
      //   if (client.readyState === 1) client.send(`connected to websocket`)
      // }
    }
  });

  fastify.get('/hello-ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
      connection.socket.send(`Hello Fastify WebSockets apiWS/hello-ws ${message} `);
    });

  });

  fastify.get('/hello-ws2', { websocket: true }, (connection, req) => {
    console.log('Client connected', req.id);//, req);
    // connection.socket.send('message on connect')   

    // const ip = req.socket.remoteAddress;
    // console.log('Client ip' ,ip);
    let message = undefined;
    connection.socket.on('message', async message => {

      const bod = `${message}`
      console.log('bod:' + bod);
      if (bod !== 'HELLO') {

        // else {

        // if (bod !== 'TEST') { 
        const entity = getEntity('brm', 'bakery');
        let rec = {}
        rec.name = bod
        rec.rating = 3


        let result

        // try {
        //   result = await entity.insertOne(rec);

        // } catch (error) {
        //   console.log(`Client error=: ${error}`);
        //   result = error
        // }
        // if (result.code !== 11000) {
        //   rec._id = result.insertedId.toString()
        //   console.log('result.insertedIds ', result.insertedId.toString())




        for (let client of fastify.websocketServer.clients) {

          // let mmm = JSON.stringify(message)
          // if (client.readyState === 1) client.send(mmm)
          // or
          if (client.readyState === 1) client.send(`${message} 1`)
          //await client.send(`${message}`)
          // connection.socket.send(` ${message} 1`);

          if (client.readyState === 1) await connection.socket.send(` ${message} 2`);
          // await client.send(`${message} 2 `)
          if (client.readyState === 1) await client.send(`${message} 3`)
          if (client.readyState === 1) await client.send(`${message} 4`)


        }
      }
      // } 
      //  else {
      //   if (client.readyState === 1) await client.send(`${message}`)
      //  }
      console.log(`Client message=: ${message}`);
      // Client disconnect
      // connection.socket.on('close', () => {
      //   console.log('Client disconnected');
      // });
    })
    if (message === undefined) {
      // let mySet = new Set([{ item: 'SomeItem', selected: true }]);
      // let itemA = "SomeItem";
      let client1 = Array.from(fastify.websocketServer.clients)[0]
      // .some(element => element.item === itemA);
      if (client1.readyState === 1) client1.send(`connected to websocket`)
      // for (let client of fastify.websocketServer.clients) {
      //   if (client.readyState === 1) client.send(`connected to websocket`)
      // }
    }

    // Client disconnect
    connection.socket.on('close', () => {
      console.log('Client disconnected');
    });
    //   return;// added by me
  });

  // localhost:8080/apiWS/hello-ws

  // fastify.get('/hello-ws2', { websocket: true }, (connection, req) => {
  //   connection.socket.on('message', message => {
  //     connection.socket.send('Hello Fastify WebSockets F4Staging')
  //   });
  // });

  //   fastify.get('/hello-ws', { websocket: true }, (connection, req) => {
  //     //   // Client connect
  //     ///// connection.socket.id = uuidv4()
  //     console.log('Client connected', req.id);
  //     connection.socket.send('message on connect F4Staging hello-ws')   

  //     // const ip = req.socket.remoteAddress;
  //     // console.log('Client ip' ,ip);
  //     // connection.socket.on('message', async message => {


  //     // })


  //     connection.socket.on('close', () => {
  //       console.log('Client disconnected');
  //     });
  //     //   return;// added by me
  //   });

  fastify.get('/bakery', {
    websocket: true
  },
    async (connection, req) => {

      // Client connect
      console.log('Client bakery connected');

      let result
      //       // const bod = req.body //JSON.stringify()
      //       // skip parse 
      //       const obj = JSON.parse(bod, reviver);

      // Client message
      connection.socket.on('message', async message => {

        // const bod = JSON.stringify(req.body)
        // const obj = JSON.parse(bod, reviver);
        //  const querystring = require('querystring');
        // Data is the data received from the client

        const entity = getEntity('brm', 'bakery');

        const bod = message;// JSON.stringify(message)
        const obj = JSON.parse(bod);//, reviver);


        let result = await entity.insertOne(obj);
        console.log('result.insertedIds ', result.insertedId.toString())

        obj._id = result.insertedId.toString()
        console.log(`Client message: ${obj}`);
      });
      // Client disconnect
      connection.socket.on('close', () => {
        console.log('Client disconnected');
      });
      return;// added by me
    });

  // fastify.route({
  //   method: 'GET',
  //   url: '/bakery',
  //   handler: async (req, reply) => {
  //     // HTTP response
  //     await sleep(500) 
  //     reply.send({ message: 'Hello Fastify bakery' });
  //   },
  //   wsHandler: async (conn, req) => {
  //     console.log('Client connected bakery');
  //     await sleep(500) 
  //     // WebSocket message
  //     // conn.socket.send('Hello Fastify WebSockets');
  //     conn.socket.on('message', message => {
  //       console.log(`Client message: ${message}`);
  //     });
  //     conn.socket.on('close', () => {
  //       console.log('Client disconnected');
  //     });
  //   }
  // });



  // fastify.route({
  //   method: 'GET',
  //   url: '/hello',
  //   handler: async (req, reply) => {
  //     // HTTP response
  //     await sleep(500)
  //     reply.send({ message: 'Hello Fastify' });
  //     // reply.sendFile('myHtml.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly

  //   },
  //   wsHandler: async (conn, req) => {
  //     console.log('Client connected');
  //     await sleep(500)
  //     // WebSocket message
  //     // conn.socket.send('Hello Fastify WebSockets');
  //     conn.socket.on('message', message => {

  //       console.log(`Client message: ${message}`);
  //     });

  //     conn.socket.on('close', () => {
  //       console.log('Client disconnected');
  //     });
  //   }
  // });


  fastify.post('/:database/:collection', {
    //  preValidation: [fastify.authenticate],

    schema: {
      params: {
        type: 'object',
        properties: {
          database: {
            description: 'The database name',
            ////  summary: 'The database name',
            type: 'string'
          },
          collection: {
            description: 'The collection name',
            ////  summary: 'The collection name',
            type: 'string'
          }
        }
      },
      body: {
        type: 'object'
      }
    }
  },
    // async (req, reply) => {
    { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {

      const { database, collection } = req.params;
      const entity = getEntity(database, collection);

      const bod = JSON.stringify(req.body)
      // const bod = req.body //JSON.stringify()
      // skip parse 
      const obj = JSON.parse(bod, reviver);

      let result;

      //await

      result = entity.insertOne(obj);
      console.log('result.insertedIds ', result.insertedId.toString())

      obj._id = result.insertedId.toString()


      // send entire record or id 
      // // fastify.io.sockets.emit('lobby', result.insertedId.toString());


      if (collection === 'bakery') {
        //// fastify.io.sockets.emit('food', obj);
        // fastify.io.emit('food', obj);
        console.log('sockets food ', obj)
        connection.socket.on('food', message => {
          // message.toString() === 'hi from client'
          connection.socket.send('food', obj);//('hi from server')
        })


      } else {
        // fastify.io.sockets.emit('lobby', obj);
        console.log('sockets lobby ', obj)
      }





      // reply.send({ status: 'ok', id: result.insertedId.toString() })
      reply.send({ status: 'ok' })//, id: result.insertedId.toString() })
      //  return
    })

  // return {database, collection};




};


// WS=Websockt
module.exports.autoPrefix = '/apiWS';