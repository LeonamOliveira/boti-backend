async function routes(fastify, options) {
  const handleError = (err, reply, customMessage) => {
    fastify.log.error(`Error: ${customMessage || err.message}`);
    reply.code(500).send(`Error: ${customMessage || err.message}`);
  }

  fastify.get('/produto_pedido', (req, reply) => {
    try { 
      fastify.mysql.getConnection(onConnect)
    
      function onConnect (err, client) {
        if (err) return reply.send(err)
        
        const sqlQuery = 'SELECT * FROM produto_pedido';

        client.query(sqlQuery, function onResult (err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      }
    } catch (err) {
      handleError(err, reply, 'Error fetching produto_pedido')
    }
  })

  fastify.get('/produto_pedido/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid produto_pedido ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        client.query(
          `SELECT * FROM produto_pedido WHERE produto_pedido_id = ${id}`,
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

  fastify.post('/produto_pedido', (req, reply) => {
    const { produto_id, pedido_id, qtd_produto_pedido, preco_produto_pedido } = req.body;

    try {
      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        const fieldValues = [produto_id, pedido_id, qtd_produto_pedido, preco_produto_pedido];
        const sqlQuery = 'INSERT INTO produto_pedido (produto_id, pedido_id, qtd_produto_pedido, preco_produto_pedido) VALUES (?, ?, ?, ?)';

        client.query(sqlQuery, fieldValues, function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      } 
    } catch (err) {
        handleError(err, reply, 'Error creating produto_pedido')
      }
    });
  
  fastify.put('/produto_pedido/:id', (req, reply) => {
    const { id } = req.params;
    const { produto_id, pedido_id, qtd_produto_pedido, preco_produto_pedido } = req.body;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid produto_pedido ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        const updateFields = [];
        const fieldValues = [];

        if (req.body) {
          Object.entries(req.body).forEach(([key, value]) => {
            updateFields.push(`${key} = ?`);
            fieldValues.push(value);
          });
        }
  
        if (updateFields.length === 0) {
          client.release();
          reply.code(400).send('No fields provided for update.');
          return;
        }

        fieldValues.push(id);
        const sqlQuery = `UPDATE produto_pedido SET ${updateFields.join(', ')} WHERE produto_pedido_id = ?`;

        client.query(sqlQuery, fieldValues, function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      } 
    } catch (err) {
        handleError(err, reply, 'Error updating produto_pedido')
      }
    });

  fastify.delete('/produto_pedido/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid produto_pedido ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)
        
        const sqlQuery = 'DELETE FROM produto_pedido WHERE produto_pedido_id = ?';

        client.query(sqlQuery, [id], function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      }
    } catch (err) {
        handleError(err, reply, 'Error deleting produto_pedido')
      }
  });
}

function isValidId(id) {
  return /^[0-9]+$/.test(id);
}

module.exports = routes