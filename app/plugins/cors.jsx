'use strict'

const fp = require('fastify-plugin');
const fastifyCors = require('@fastify/cors');
// import fastifyIO from "fastify-socket.io";
const fastifyIO = require('fastify-socket.io')
// import fastifyCors from "fastify-cors";
module.exports = fp(async (fastify, opts) => {
  // const corsOpts = Object.assign ({}, {
  //    origin: '*',
  //    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  // }, opts.cors);

  // fastify.register(cors, corsOpts);


  // https://fastify.dev/docs/latest/Guides/Migration-Guide-V4/
  // https://github.com/ducktors/fastify-socket.io/issues/14
//curl "http://localhost:8080/socket.io/?EIO=4&transport=polling"
// io.listen(8081);
  await fastify.register(fastifyCors, {
    origin: "*",
    methods: "GET,POST,PUT,PATCH,DELETE",
  });
  
  //origin: "http://127.0.0.1:8080",
  await fastify.register(fastifyIO, {
    cors: {
      // origin: "http://localhost:8080",
      origin: "http://localhost:8081",
      // origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });


});
