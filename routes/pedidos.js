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
        
        const sqlQuery = `SELECT 
          pedido_id, numero_pedido, valor_total_pedido, DATE_FORMAT(data_pedido, '%d/%m/%Y') as data_pedido, status, cliente_id 
        FROM pedido`;

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

    fastify.post('/pedidos', (req, reply) => {
      const { numero_pedido, valor_total_pedido, data_pedido, status, cliente_id } = req.body;
  
      try {
        if(!data_pedido || !cliente_id) {
          reply.code(400).send('Data Pedido and Cliente ID are required');
          return;
        }

        fastify.mysql.getConnection(onConnect)
  
        function onConnect(err, client) {
          if (err) return reply.send(err)
  
          const fieldValues = [numero_pedido, valor_total_pedido, data_pedido, status, cliente_id];
          const sqlQuery = 'INSERT INTO pedido (numero_pedido, valor_total_pedido, data_pedido, status, cliente_id) VALUES (?, ?, ?, ?, ?)';
  
          client.query(sqlQuery, fieldValues, function onResult(err, result) {
              client.release()
              reply.send(err || result)
            }
          )
        } 
      } catch (err) {
          handleError(err, reply, 'Error creating pedido')
        }
    });

    fastify.put('/pedidos/:id', (req, reply) => {
      const { id } = req.params;
      const { numero_pedido, valor_total_pedido, data_pedido, status, cliente_id } = req.body;
  
      try {
        if (!isValidId(id)) {
          reply.code(400).send('Invalid pedido ID. Please provide a valid numeric ID');
        }
  
        fastify.mysql.getConnection(onConnect);
  
        function onConnect(err, client) {
          if (err) return reply.send(err)
  
          const fieldValues = [numero_pedido, valor_total_pedido, data_pedido, status, cliente_id, id];
          const sqlQuery = 'UPDATE pedido SET numero_pedido = ?, valor_total_pedido = ?, data_pedido = ?, status = ?, cliente_id = ? WHERE pedido_id = ?';
  
          client.query(sqlQuery, fieldValues, function onResult(err, result) {
              client.release()
              reply.send(err || result)
            }
          )
        } 
      } catch (err) {
          handleError(err, reply, 'Error updating pedido')
        }
    });

    fastify.delete('/pedidos/:id', (req, reply) => {
      const { id } = req.params;
  
      try {
        if (!isValidId(id)) {
          reply.code(400).send('Invalid pedido ID. Please provide a valid numeric ID.');
          return;
        }
  
        fastify.mysql.getConnection(onConnect);
  
        function onConnect(err, client) {
          if (err) return reply.send(err);
          
          const sqlQuery =  'DELETE FROM pedido WHERE pedido_id = ?';
  
          client.query(sqlQuery, [id], function onResult(err, result) {
              client.release();
              reply.send(err || result);
            }
          );
        }
      } catch (err) {
        handleError(err, reply, 'Error deleting pedido')
      }
    });
}

function isValidId(id) {
  return /^[0-9]+$/.test(id);
}

module.exports = routes