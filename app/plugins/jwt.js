

//const AuthMongoJwt = require('fastify-auth-mongo-jwt')
//https://github.com/mcollina/fastify-auth-mongo-jwt
//POST /signup
//POST LOGIN
'use strict'
const fp = require('fastify-plugin')
//const app = Fastify()//

module.exports = fp(async (fastify, opts) => {
    //  fastify.register(require('fastify-jwt'), {
        fastify.register(require('@fastify/jwt'), {
            secret: opts.auth ? opts.auth.secret : process.env.SECRET || 'gtzsecret@148'
    })

    // However, most of the time we want to protect only some of the routes in our application. To achieve this you can wrap your authentication logic into a plugin like
    fastify.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify()
        } catch (err) {
            // reply.send(err)
            return err
        }
    })

})





// //const AuthMongoJwt = require('fastify-auth-mongo-jwt')
// //https://github.com/mcollina/fastify-auth-mongo-jwt
// //POST /signup
// //POST LOGIN
// 'use strict'
// const fp = require('fastify-plugin')

// // fastify.register(require('@fastify/jwt'), {
// //const app = Fastify()//

// module.exports = fp(async (fastify, opts) => {
//     // this defines const users = app.mongo.db.collection('users')
//     fastify.register(require('@fastify/jwt'), {
//         secret: opts.auth ? opts.auth.secret : process.env.SECRET || 'gtzsecret@148'
//     })

//     // However, most of the time we want to protect only some of the routes in our application. To achieve this you can wrap your authentication logic into a plugin like
//     fastify.decorate("authenticate", async function (request, reply) {
//         try {
//             let jwt = await request.jwtVerify()
//             console.log('jwt ', jwt)
//             return await request.jwtVerify()

//         } catch (err) {
//             // reply.send(err)
//             return (err);
//         }
//     })

// })

