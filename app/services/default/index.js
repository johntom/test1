'use strict'

module.exports = async function (fastify, opts) {
  // console.log('Default service started...');

  fastify.get('/', 
    async (req, reply) => {


      const ver = process.env.VERSION;
      const othervars=' ip:'+ process.env.ADDRESS+' port:'+process.env.PORT+' drive:'+process.env.drive
      
      const extra = 'mongodonF4Staging'
  
      const version = `${ver} - ${othervars}  - ${extra} `
     
     // fastify.io.sockets.emit('lobby', {version});
      return {version};
    }
  );
  fastify.get('/session', 
  async (req, reply) => {

    // console.log(req.session.sessionId);//, oldSessionId)
    const ver = process.env.VERSION ;
    const othervars=' ip:'+ process.env.ADDRESS+' port:'+process.env.PORT+' drive:'+process.env.drive
    const extra = 'mongodonF4Staging'
    console.log('========================extra ',extra)  
    const version = `${ver} - ${othervars} -  ${extra} - `
    console.log('========================version ',version)
   // fastify.io.sockets.emit('lobby', {version});
    return {version};
  }
);
  

};

module.exports.autoPrefix = '/meta';
