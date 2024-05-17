

'use strict'


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
  // function dateParser(key, value) {
  //   if (typeof value === 'string') {
  //     if (Date.parse(value)) {
  //       return new Date(value);
  //     }
  //   }
  //   return value;
  // }
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
      // 3.28.22 MOVED BELOW
      // if (key === 'file') {
      //   //pdf names have a timestap
      //   return value;
      // }
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

  
  //
  // List Databases
  //
  fastify.get('/databases', {
    preValidation: [fastify.authenticate],
    schema: {
      params: {}
    }
  },
    async (req, reply) => {
      const databases = require('../../../databases.json');
      fastify.io.sockets.emit('lobby', databases);
      return databases;
    }
  );
  //
  // List Collections
  //
  fastify.get('/:database/collections', {
    preValidation: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          database: {
            description: 'The database name for listing collections',
           // //   summary:: 'The database name',
            type: 'string'
          }
        }
      }
    }
  },
    async (req, reply) => {
      const {
        database
      } = req.params;
      const result = await fastify.mongo[database].db.listCollections().toArray();
      fastify.io.sockets.emit('lobby', result);
      return result;
      // return {database};
    }
  );

  //
  // Run Command
  //
  fastify.get('/:database/runCommand', {
    preValidation: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          database: {
            description: 'The database name',
           // //   summary:: 'The database name',
            type: 'string'
          }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          command: {
            description: 'The command to execute as a JSON string',
            //   summary:: 'The command to execute',
            type: 'string'
          }
        },
        required: [
          'command'
        ]
      }
    }
  },
    async (req, reply) => {
      const {
        database
      } = req.params;
      const {
        command = null
      } = req.query;
      let query = {};
      if (command) {
        query = JSON.parse(command, reviver);
      }
      const result = await fastify.mongo[database].db.command(query);
      fastify.io.sockets.emit('lobby', result);
      // return result;
      reply.send(result ) 
    }
  );
  //
  // Delete (Delete)
  //
  fastify.delete('/:database/:collection/:id', {
    preValidation: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          database: {
            description: 'The database name',
            //   summary:: 'The database name',
            type: 'string'
          },
          collection: {
            description: 'The collection name',
            //   summary:: 'The collection name',
            type: 'string'
          },
          id: {
            description: 'The id of the document',
            //   summary:: 'The id',
            type: 'string'
          }
        }
      }
    }
  },
    async (req, reply) => {
      const {
        database,
        collection,
        id
      } = req.params;
      const entity = getEntity(database, collection);
      const _id = require('mongodb').ObjectId(id); // cant use reviver here as param
      const result = await entity.deleteOne({
        _id
      });
      fastify.io.sockets.emit('lobby', result);
      if (!result.deletedCount) {
        return reply.code(404).send({
          status: 'Not found!'
        });
      }
      return result.deletedCount;
      // return {database, collection, id, _id, result};
    }
  );
  //
  // Delete (Delete Many)
  //
  fastify.delete('/:database/:collection', {
    preValidation: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          database: {
            description: 'The database name',
            //   summary:: 'The database name',
            type: 'string'
          },
          collection: {
            description: 'The collection name',
            //   summary:: 'The collection name',
            type: 'string'
          }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          filter: {
            description: 'The filter criteria as a JSON string',
            //   summary:: 'The filter criteria',
            type: 'string'
          }
        },
        required: []
      },
      body: {
        type: 'object'
      }
    }
  },
    async (req, reply) => {
      const { database, collection, id } = req.params;
      console.log('  database,        collection,  ', database, collection)
      const { filter } = req.query;
      // const bod = JSON.stringify(req.body)
      // const bod = req.body //JSON.stringify()
      // skip parse 
      // const obj = JSON.parse(bod, reviver);

      let query = {};
      if (filter) {
        // query = JSON.parse(filter, reviver);

        query = JSON.parse(filter);
        if (query._id) {
          query._id = require('mongodb').ObjectId(query._id);
        }
      }
      const entity = getEntity(database, collection);
      const result = await entity.deleteMany(query);
      fastify.io.sockets.emit('lobby', result);
      if (!result.deletedCount) {
        return reply.code(404).send({
          status: 'Not found!'
        });
      }
      return result.deletedCount;
      // return {database, collection};
    }
  );
  //
  // Get (Retreive)
  // http://localhost:8080/api/todo/todo
  fastify.get('/:database/:collection',
    {
    //  preValidation: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              //   summary:: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              //   summary:: 'The collection name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            filter: {
              description: 'The filter criteria as a JSON string',
              //   summary:: 'The filter criteria',
              type: 'string'
            },
            orderBy: {
              description: 'The orderBy expression as a JSON string',
              //   summary:: 'The orderBy expression',
              type: 'string'
            },
            limit: {
              description: 'The limit ',
              //   summary:: 'The limit',
              type: 'integer'
            },
            skip: {
              description: 'The ,skip ',
              //   summary:: 'The skip',
              type: 'integer'
            },
            fo: {
              description: 'The find one flag',
              //   summary:: 'Find one',
              type: 'boolean'
            },
            f: {
              description: 'The fields object',
              //   summary:: 'The fields object',
              type: 'string'
            },
            c: {
              description: 'Count the number of documents',
              //   summary:: 'Count',
              type: 'boolean'
            }
          },
          required: []
        },

      },

    },
    async (req, reply) => {
      const { database, collection } = req.params;
      const { filter, orderBy, limit = 0, skip = 0, fo = false, f = null, c = false, ci, filterregex } = req.query;
      let query = {};
      let sort = {};
      let project = {};
      let findOne = fo;

     
      if (filter) {
        console.log('filter', filter)
        // query = JSON.parse(filter);//, reviver);
        query = JSON.parse(filter, reviver);

        console.log('query', query)
      }

      // console.log("filter", filter) //[0].lastName} `)

      if (orderBy) {

        // sort = JSON.stringify(orderBy)
        sort = JSON.parse(orderBy)//, reviver);
      }
      // if(sort==="{POID:-1}") sort={POID:-1}
      // console.log('orderBy  ', ' sort ', sort)
      // console.log('limit ', limit)
      // console.log('query +', query)



      if (f) {
        console.log(f);
        project = JSON.parse(f);
      }
      // console.log('project +', project)

      const entity = getEntity(database, collection);
      let result;
      if (findOne) {
        if (f) {
          result = await entity.findOne(query, {
            projection: project
          });
        } else {
          result = await entity.findOne(query);
        }
      } else {
        if (f) {
          // let pp={POID:1,VendorID:1}
          result = await entity.find(query).project(project).sort(sort).skip(+skip).limit(+limit).toArray();
        } else {
          if (c) {
            result = await entity.find(query).count();
          } else {
            result = await entity.find(query).sort(sort).skip(+skip).limit(+limit).toArray();
            //  result = await entity.find(query).toArray();
          }
        }
      }
      fastify.io.sockets.emit('lobby', result);
      console.log('result', result.length)
      console.log('=======================')

      reply.send(result ) //
      // return result;

    }
  );
  //
  // Get By Id (Retreive one)
  //
  fastify.get('/:database/:collection/:id', {
   // preValidation: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          database: {
            description: 'The database name',
            //   summary:: 'The database name',
            type: 'string'
          },
          collection: {
            description: 'The collection name',
            //   summary:: 'The collection name',
            type: 'string'
          },
          id: {
            description: 'The document id',
            //   summary:: 'The document id',
            type: 'string'
          }
        }
      }
    }
  },
    async (req, reply) => {

      const {
        database,
        collection,
        id
      } = req.params;
      const entity = getEntity(database, collection);
      // const _id = new ObjectId(id);
      console.log('get _id===collection========= ', collection)
      const _id = require('mongodb').ObjectId(id);
      console.log(`===============reply======================${_id} --  -- ${req.session.authenticated}`) //[0].lastName} `)
      // if (req.session.authenticated) {

      const result = await entity.findOne({
        _id
      });
      // 
      //  fastify.io.sockets.emit('lobby', result);
      //   return {database, collection, id, _id, result};
      //  } else result = 'not autenticated'
      console.log('===result========= ', result)
      // return {result};
      return { data: result };
    }
  );

  // special get ' https://backend.brmflow.com/api/brm/froi/1/special '
  // http://10.1.215.217/api/brm/froi/1/special
  fastify.get('/:database/:collection/:id/special', {
    preValidation: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          database: {
            description: 'The database name',
            //   summary:: 'The database name',
            type: 'string'
          },
          collection: {
            description: 'The collection name',
            //   summary:: 'The collection name',
            type: 'string'
          },
          id: {
            description: 'The document id',
            //   summary:: 'The document id',
            type: 'string'
          }
        }
      }
    }
  },
    async (req, reply) => {
      const {
        database,
        collection,
        id
      } = req.params;
      const entity = getEntity(database, collection);
      console.log('get _id===collection========= ', collection)



      const obj = await entity.findOne({
        sid: id * 1
      });

      let headobj = { 'Authorization': `Bearer ${token}` }

      if (collection === 'froi' || collection === 'sroi') {
        fastify.inject({
          method: 'post',
          headers: headobj,
          payload: obj,
          url: `/api/brm/v1/createpdf/${collection}`
        }, (err, response) => {
          if (err) {
            next(err)
          } else {

          }
        })
      }
      return obj;
    }
  );
  //
  // Post (Create)
  //

  fastify.post('/:database/:collection', {
    preValidation: [fastify.authenticate],
  
    schema: {
      params: {
        type: 'object',
        properties: {
          database: {
            description: 'The database name',
            //   summary:: 'The database name',
            type: 'string'
          },
          collection: {
            description: 'The collection name',
            //   summary:: 'The collection name',
            type: 'string'
          }
        }
      },
      body: {
        type: 'object'
      }
    }
  },
    async (req, reply) => {
      const { database, collection } = req.params;
      const entity = getEntity(database, collection);
      //The JSON.stringify() method converts a JavaScript object or value to a JSON string,
      // The JSON.parse() method parses a JSON string, 
      // const obj = JSON.parse(req.body, reviver);
      // let bod = JSON.stringify(req.body)

      // const obj = req.body.data //
      // const listname = req.body.listname
      //delete req.body._id  // for create val
      const bod = JSON.stringify(req.body)
      // const bod = req.body //JSON.stringify()
      // skip parse 
      const obj = JSON.parse(bod, reviver);

      let result;

      if (collection === 'copyrecs') {
        // fastify.log,info(obj)
        //  console.log(obj) 
        // D:\Docs\Images\Claims\70104 
        // 0:1025231
        // 1:1025232
        let movefrombase = `${drive}:\\docs\\images\\Claims\\${obj.wcid}\\${obj.type}\\`
        // let movetobase = `${drive}:\\pdf\\${obj.username}\\`
        // let movetobase = `${userdrive}:\\${obj.username}\\pdf\\`
        let movetobase = `${drive}:\\docs\\_pdfexport\\${obj.username}\\`
        /////let movetobase = `${userdrive}:\\pdf\\${obj.username}\\`
        console.log('movetobase', movetobase)
        let movefrom
        let moveto
        for (const rec of obj.copyrecs) {
          movefrom = `${movefrombase}${rec}.pdf`
          moveto = `${movetobase}${rec}.pdf`
          // let hname1 = path.resolve(`${drive}:/docs/Images/pdf/checks/Check1.html`); // pre exit 1st check
          try {
            await fs.copy(movefrom, moveto)
            await sleep(500) // not sure why it fauils w/o this
          } catch (e) {
            fastify.log.error('failed to copy ', movefrom, moveto)
            console.error('failed to copy ', e, movefrom, moveto)
          }


        }
        reply.send({ status: 'ok' })//, id: result.insertedId.toString() })
        //  return

      } else {

        if (Array.isArray(obj)) {
          // see mrg mailinglist for multi inserts
          result = await entity.insertMany(obj);
          console.log('result ', result)//,result.insertedIds.toString())
          console.log('result.insertedIds ', result.insertedIds)//,result.insertedIds.toString())

          return result//.insertedIds.toString();
        } else {
          //   delete obj._id
          result = await entity.insertOne(obj);
          console.log('result.insertedIds ', result.insertedId.toString())

          obj._id = result.insertedId.toString()
          console.log('sockets ', obj)

          // send entire record or id 
   
          // fastify.io.sockets.emit('food', obj); // works
          fastify.io.emit('food', obj);
          console.log('AFTER sockets ', obj)


          //fastify.io.emit('lobby', obj);

          //? let headobj = { 'Authorization': `Bearer ${token}` }

          // if (collection === 'froi' || collection === 'sroi') {
          //   fastify.inject({
          //     method: 'post',
          //     headers: headobj,
          //     payload: obj,
          //     url: `/api/brm/v1/createpdf/${collection}`
          //   }, (err, response) => {
          //     if (err) {
          //       next(err)
          //     } else {

          //     }
          //   })
          // }


          // reply.send({ status: 'ok', id: result.insertedId.toString() })
          reply.send({ status: 'ok' })//, id: result.insertedId.toString() })
          //  return
        }

        // return {database, collection};
      }
    });
  //
  fastify.put('/:database/:collection',
   {
    preValidation: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          database: {
            description: 'The database name',
            //   summary:: 'The database name',
            type: 'string'
          },
          collection: {
            description: 'The collection name',
            //   summary:: 'The collection name',
            type: 'string'
          }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          filter: {
            description: 'The filter criteria as a JSON string',
            //   summary:: 'The filter criteria',
            type: 'string'
          }
        },
        // required: [
        //   'filter'
        // ]
      },

      body: {
        type: 'object'
      }
    }
  },
  async (req, reply) => {
    const { database, collection } = req.params;
    // const { filter, updatestmt } = req.query;
    console.log(" fastify.put('/:database/:collection'")
    const entity = getEntity(database, collection);
    console.log('collection', collection)
    const bod = JSON.stringify(req.body)
    const obj = JSON.parse(bod, reviver);
    let query

    let updatemanuflag = false
    let updatestmt = req.body.updatestmt
    if (updatestmt !== undefined) {
      // updatemanuflag=true

      let filter = req.body.filter
      // if (filter) { 
      if (filter !== undefined) {
        console.log('filter', filter)
        query = JSON.parse(filter, reviver);
        updatemanuflag = true
      }

    }
    // if (obj.filter !== undefined) {
    if (updatemanuflag === true) {
      let result = await entity.updateMany(query, { $set: updatestmt })

      console.log('collection', result)
      fastify.io.sockets.emit('lobby', result);
      reply.send({ data: result }) //
    } else {
      query = {
        _id: require('mongodb').ObjectId(obj._id)
      } //obj._id};

      delete obj._id;
      let isodate2 = new Date() // this inserts as isodate
      obj.updatedAt = isodate2
      obj.testit = 3
      if (collection === 'grid' && obj.clearfilter) {
        obj.filters = ''
      }
      // obj.filters = ''
      let result1 = await entity.updateOne(query, { $set: obj }, { upsert: true });
      fastify.io.sockets.emit('lobby', obj);
      reply.send({ data: result1 }) 
    
    }

    // fastify.io.sockets.emit('lobby', obj);

    // reply.send({ data: result })
  });

  fastify.get('/chil',
  {
    schema: {
      params: {}
    }
  },
  async (req, reply) => {
    console.log("/api/chil")
    let encstr2 = '8C5BE82339D703B61572C8169D5CA5BB'
    // let qryres = await chilkat_decrypt(encstr2)
    let qryres = await fastify.childecrypt(encstr2)
    console.log('qryres', qryres)
    // console.log('================formname=======', result[0].formname)
    reply.send(qryres.data)
    // return result;
  }
);


};



module.exports.autoPrefix = '/api';