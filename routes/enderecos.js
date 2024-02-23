async function routes(fastify, options) {
  const handleError = (err, reply, customMessage) => {
    fastify.log.error(`Error: ${customMessage || err.message}`);
    reply.code(500).send(`Error: ${customMessage || err.message}`);
  }

  fastify.get('/enderecos', (req, reply) => {
    try { 
      fastify.mysql.getConnection(onConnect)
    
      function onConnect (err, client) {
        if (err) return reply.send(err)
        
        const sqlQuery = 'SELECT * FROM endereco';

        client.query(sqlQuery, function onResult (err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      }
    } catch (err) {
      handleError(err, reply, 'Error fetching enderecos')
    }
  })

  fastify.get('/enderecos/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid endereco ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        const fieldValues = [id];
        const sqlQuery = `SELECT * FROM endereco WHERE endereco_id = ${id}`;
        
        client.query(sqlQuery, fieldValues, function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      } 
    } catch (err) {
        handleError(err, reply, 'Error fetching enderecos')
      }
    });

  fastify.put('/enderecos/:id', (req, reply) => {
    const { id } = req.params;
    const { cep, rua, bairro, cidade, numero, complemento, uf } = req.body;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid address ID. Please provide a valid numeric ID')
      }

      fastify.mysql.getConnection(onConnect);

      function onConnect(err, client) {
        if(err) return reply.send(err);

        const updateFields = [];
        const fieldValues = [];

        if(req.body) {
          Object.entries(req.body).forEach(([key, value]) => {
            updateFields.push(`${key} = ?`);
            fieldValues.push(value);
          });
        }

        if(updateFields.length === 0) {
          client.release();
          reply.code(400).send('No fields provided for update.');
          return;
        }

        const sql = `UPDATE endereco SET ${updateFields.join(', ')} WHERE endereco_id = ${id}`;
        
        fieldValues.push(id);

        client.query(sql, fieldValues, function onResult(err, result) {
          client.release();
          reply.send(err || result);
        });
      }
    } catch (err) {
      handleError(err, reply, 'Error update enderecos');
    }
  });
  
  fastify.delete('/enderecos/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid address ID. Please provide a valid numeric ID.');
        return;
      }
  
      fastify.mysql.getConnection(onConnect);
  
      function onConnect(err, client) {
        if (err) return reply.send(err);
        
        const sqlQuery =  'DELETE FROM endereco WHERE endereco_id = ?';

        client.query(sqlQuery, [id], function onResult(err, result) {
            client.release();
            reply.send(err || result);
          }
        );
      }
    } catch (err) {
      handleError(err, reply, 'Error deleting endereco')
    }
  });

  fastify.post('/enderecos', (req, reply) => {
    const { cep, rua, bairro, cidade, numero, complemento, uf } = req.body;

    try {
      
      fastify.mysql.getConnection(onConnect);
      
      function onConnect(err, client) {
        if (err) return reply.send(err);

        const fieldValues = [cep, rua, bairro, cidade, numero, complemento, uf];
        const sqlQuery = 'INSERT INTO endereco (cep, rua, bairro, cidade, numero, complemento, uf) VALUES (?, ?, ?, ?, ?, ?, ?)';

        client.query(sqlQuery, fieldValues, function onResult(err, result) {
            client.release();
            reply.send(err || result);
          }
        );
      }
    } catch (err) {
      handleError(err, reply, 'Error creating endereco');
    }
  });
}

function isValidId(id) {
  return /^[0-9]+$/.test(id);
}

module.exports = routes