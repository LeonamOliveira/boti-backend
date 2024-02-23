async function routes(fastify, options) {
  const handleError = (err, reply, customMessage) => {
    fastify.log.error(`Error: ${customMessage || err.message}`);
    reply.code(500).send(`Error: ${customMessage || err.message}`);
  }

  fastify.get('/pedidos', (req, reply) => {
    try { 
      fastify.mysql.getConnection(onConnect)
    
      function onConnect (err, client) {
        if (err) return reply.send(err)
        
        const sqlQuery = 'SELECT * FROM pedido';

        client.query(sqlQuery, function onResult (err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      }
    } catch (err) {
      handleError(err, reply, 'Error fetching pedidos')
    }
  })

  fastify.get('/pedidos/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid pedido ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        client.query(
          `SELECT * FROM pedido WHERE pedido_id = ${id}`,
          function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      } 
    } catch (err) {
        reply.code(500).send('Error fetching client:', err);
        throw err; 
      }
    });
}

function isValidId(id) {
  return /^[0-9]+$/.test(id);
}

module.exports = routes