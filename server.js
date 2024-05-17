'use strict'

const assert = require('assert')
const fp = require('fastify-plugin')
const fs = require('fs')
const resolveFrom = require('resolve-from')
const parseArgs = require('./args')
const path = require('path')
const fastifyCors = require('@fastify/cors');
const fastifyIO = require('fastify-socket.io')
const pump = require('pump')
let Fastify = null
// a


//https://www.jaywolfe.dev/blog/setup-your-fastify-server-with-logging-the-right-way-no-more-express/
function showHelp() {
  fs.readFile(path.join(__dirname, 'help', 'start.txt'), 'utf8', (err, data) => {
    if (err) {
      module.exports.stop(err);
    }
    console.log(data);

    module.exports.stop();
  });
}
function stop(error) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  process.exit();
}
function loadModules(opts) {
  try {
    const basedir = path.resolve(process.cwd(), opts.file);
    Fastify = require(resolveFrom.silent(basedir, 'fastify') || 'fastify');
  } catch (e) {
    module.exports.stop(e);
  }
}
function start(args, cb) {
  let opts = parseArgs(args);
  if (!fs.existsSync(opts.file)) {
    console.error('Missing the required file app.js\n');
    return showHelp();
  }
  if (opts.help) {
    return showHelp();
  }
  require('make-promises-safe');
  loadModules(opts);


  return run(args, cb);

}
async function  run(args, cb) {
  require('dotenv').config();
  let opts = parseArgs(args);

  opts.port = opts.port || process.env.PORT || 9050;//3000;

  opts.address = opts.address || process.env.ADDRESS || 'localhost';
  console.log('=== Version ', process.env.VERSION, '\nprocess.env.ADDRESS ', process.env.ADDRESS, '\nopts.port', process.env.PORT, '\nopts ', opts)

  cb = cb || assert.ifError;

  loadModules(opts);

  var file = null;
  try {
    file = require(path.resolve(process.cwd(), opts.file));
    console.log('=== file ', opts.file)

  } catch (e) {
    return module.exports.stop(e);
  }
  if (file.length !== 3 && file.constructor.name === 'Function') {
    return module.exports.stop(`Plugin function should contain 3 arguments. Refer to\n
      docs for more information about it`);
  }
  if (file.length !== 2 && file.constructor.name === 'AsyncFunction') {
    return module.exports.stop(`Aysnc/Await plugin function should contain 2 arguments. Refer to\n
      docs for more information about it`);
  }
  
  const options = {
    logger: true
  };

  console.log('options', options.logger)
  if (opts.bodyLimit) {
    options.bodyLimit = opts.bodyLimit;
  }
  // if (opts.prettyLogs) {
  //   const pinoColada = PinoColada();
  //   options.logger.stream = pinoColada;
  //   pump(pinoColada, process.stdout, assert.ifError);
  // }
  const fastify = Fastify(opts.option ? Object.assign(options, file.options) : options);
  const pluginOptions = {};
  if (opts.prefix) {
    pluginOptions.prefix = opts.prefix;
    pluginOptions._routePrefix = opts.prefix || '';
  }

  // const pluginOptions2 = {}
  // pluginOptions2.a = 'test1'
  // pluginOptions2.b = 'test2'
 
  await fastify.register(fp(file), pluginOptions);


  await fastify.register(fastifyCors, {
    origin: "*",
    methods: "GET,POST,PUT,PATCH,DELETE",
  });
  
 
  // can move to pi
  await fastify.register(fastifyIO, {
     cors: {
      origin: "http://localhost:8080",
      // origin: "http://localhost:8081",
      // origin: ["http://localhost:3000", "http://localhost:3001"],
    //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
     },
  });

//   fastify.register(require('fastify-socket.io'), {
//     cors: {
//     origin: "http://localhost:8080",
//     //methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   },
// });
console.log('fastify-socket.io connect');
fastify.ready(async err => {
if (err) throw err;
// await 
fastify.io.on('connect', (socket) => {
console.log('fastify.connect');//, socket);
})
});



  const port = 8080;
  const hostname = 'localhost'
  // console.log(`http://${opts.address}:${opts.port}/meta`);
  console.log(`http://${hostname}:${port}/meta`);
 
fastify.listen({ port: port, host: hostname }, (err, address) => {
    // process.env
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    // console.log(`server address ${address}/meta`);
    console.log(`server address ${address}`);
  })

  function wrap(err) {
    cb(err, fastify);
  }


  return fastify;
}
function cli(args) {
  console.log('arg ', args)
  start(args);
}

module.exports = { start, run, stop };

if (require.main === module) {
  cli(process.argv.slice(2));
}
