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

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid endereco ID. Please provide a valid numeric ID')
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

        const sqlQuery = `UPDATE endereco SET ${updateFields.join(', ')} WHERE endereco_id = ?`;
        fieldValues.push(id);

        client.query(sqlQuery, fieldValues, function onResult(err, result) {
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
        reply.code(400).send('Invalid endereco ID. Please provide a valid numeric ID.');
        return;
      }
  
      fastify.mysql.getConnection(onConnect);
  
      function onConnect(err, client) {
        if (err) return reply.send(err);
  
        client.query(
          'DELETE FROM endereco WHERE endereco_id = ?',
          [id],
          function onResult(err, result) {
            client.release();
            reply.send(err || result);
          }
        );
      }
    } catch (err) {
      handleError(err, reply, 'Error deleting endereco')
    }
  });

  fastify.post('/enderecos', async (req, reply) => {
    try {
      const {
        cep,
        rua,
        bairro,
        cidade,
        numero,
        complemento,
        uf
      } = req.body;

      fastify.mysql.getConnection(onConnect);

      function onConnect(err, client) {
        if (err) return reply.send(err);
        // INSERT INTO endereco(cep, rua, bairro, cidade, numero, complemento, uf) VALUES ('77777888', 'w1', 'Jd America', 'Rio de Fevereiro', '1', 'qd 1', 'RJ');

        const sql = `INSERT INTO endereco(cep, rua, bairro, cidade, numero, complemento, uf) 
          VALUES(?, ?, ?, ?, ?, ?, ?)`;

        
        client.query(sql, function onResult(err, result) {
          client.release();
          reply.send(err || result);
        });
      }
    } catch (err) {
      handleError(err, reply, 'Error creating endereco')
    }
  })
}

function isValidId(id) {
  return /^[0-9]+$/.test(id);
}

module.exports = routes