'use strict'

const fp = require('fastify-plugin');
const fs = require('fs');


module.exports = fp(async (fastify, opts) => {
  console.log('Registering databases...');
fastify
  //local 
 //  .register(require('@fastify/mongodb'), {  useUnifiedTopology: true,useNewUrlParser: true,url: process.env.MONGODB_URLbrm, name: 'brm' } )
   .register(require('@fastify/mongodb'),{tlsAllowInvalidCertificates:true,  useUnifiedTopology: true, useNewUrlParser: true, url:process.env.MONGODB_URLbrm,name: 'brm' })  
   .register(require('@fastify/mongodb'),{tlsAllowInvalidCertificates:true,  useUnifiedTopology: true, useNewUrlParser: true, url:process.env.MONGODB_URLtodo,name: 'todo' })
  fastify.log.info('/pi 002===plugin================fastify mongodb===ONGODB_URLbrm==');
  fastify.log.info('/pi 002===plugin================fastify mongodb====MONGODB_URLtodo==');


});

 