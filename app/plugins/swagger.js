'use strict'

const fp = require('fastify-plugin')
const fastifySwagger = require('@fastify/swagger')
const fastifySwaggerUi = require('@fastify/swagger-ui')
// http://127.0.0.1:8080
// http://localhost:3000/documentation FAILS
//  host: 'localhost:3000',
// http://localhost:8080/documentation
//ode: 'dynamic',
// mode: 'static',
// specification: {
//   path: 'D:/fastify-gp/_fromgit/mongodon2/app/plugins/example-static-specification.json',
//   //../plugins/example-static-specification.json'
// },
// host: 'localhost:3000',
// consumes: ['application/json'],
module.exports = fp(async (fastify, opts) => {
  
  await fastify.register(fastifySwagger, {
    mode: 'dynamic',

    exposeRoute: true,
    openapi: {
      info: {
        title: 'Test swagger',
        description: 'Testing the Fastify swagger API',
        version: '0.1.0'
      },
      externalDocs: {
        "description": "Find out more about Swagger",
        "url": "http://swagger.io"
      },
      // servers: [ Object ],
      // components: Object,
      // security: [ Object ],
      tags: [
        { name: 'user', description: 'User related end-points' },
        { name: 'code', description: 'Code related end-points' }
      ],
      schemes: [
        "https",
        "http"
      ],
    
 
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      apiKey: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
      
    }
  })
  
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    initOAuth: { },
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  })




})

