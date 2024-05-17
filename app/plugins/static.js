
'use strict'
const fp = require('fastify-plugin')
const path = require('path')

// // const join = require('path').join;
// // const root = 'd:\\fastify-gp\\mongodonBRMNode16CopyPOV';//\\app\\plugins
// // const root = `..\\..\\${__dirname}`
const { dirname } = require('path');
// An absolute path containing static files to serve.
// root: path.join(__dirname, '/public')
// root: path.join(__dirname, '../../../public'),
   
const rootp = dirname(require.main.filename);
module.exports = fp(async (fastify, opts) => {
     
    fastify.register(require('@fastify/static'), {
        root: path.join(rootp, 'public'),
        prefix: '/public/' // optional: default '/'
        //  constraints: { host: 'example.com' } // optional: default {}
    });
    // fastify.get('/*', function (request, reply) {
    fastify.get('/static1', function (request, reply) {
        reply.sendFile('myHtml.html'); //index.
    });
    fastify.get('/static2', function (request, reply) {
        reply.sendFile('myHtmlfingerprint.html'); //index.
    });
    // root: path.join(__dirname, '..', '..', '..', 'templates'),
    // fastify.get('/another/path', function (req, reply) {
    //     reply.sendFile('myHtml.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
    //   })
})

