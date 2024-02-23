async function routes(fastify, options) {
  const handleError = (err, reply, customMessage) => {
    fastify.log.error(`Error: ${customMessage || err.message}`);
    reply.code(500).send(`Error: ${customMessage || err.message}`);
  }

  fastify.get('/clientes', (req, reply) => {
    try { 
      fastify.mysql.getConnection(onConnect)
    
      function onConnect (err, client) {
        if (err) return reply.send(err)
        
        const sqlQuery = `
          SELECT cliente_id, nome, cpf, email, telefone, DATE_FORMAT(data_nascimento, '%d/%m/%Y') as data_nascimento, endereco_id, username, senha
            FROM cliente`;

        client.query(sqlQuery, function onResult (err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      }
    } catch (err) {
      handleError(err, reply, 'Error fetching clients')
    }
  })

  fastify.get('/clientes/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid client ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        const fieldValues = [id];
        const sqlQuery = 'SELECT * FROM cliente WHERE cliente_id = ?';

        client.query(sqlQuery, fieldValues, function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      } 
    } catch (err) {
        handleError(err, reply, 'Error fetching client')
      }
    });

  fastify.put('/clientes/:id', (req, reply) => {
    const { id } = req.params;
  
    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid client ID. Please provide a valid numeric ID.');
        return;
      }
  
      fastify.mysql.getConnection(onConnect);
  
      function onConnect(err, client) {
        if (err) return reply.send(err);
  
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
  
        const sqlQuery = `UPDATE cliente SET ${updateFields.join(', ')} WHERE cliente_id = ?`;
        fieldValues.push(id);
  
        client.query(sqlQuery, fieldValues, function onResult(err, result) {
          client.release();
          reply.send(err || result);
        });
      }
    } catch (err) {
      handleError(err, reply, 'Error updating client');
    }
  });

  fastify.delete('/clientes/:id', (req, reply) => {
    const { id } = req.params;
  
    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid client ID. Please provide a valid numeric ID.');
        return;
      }
  
      fastify.mysql.getConnection(onConnect);
  
      function onConnect(err, client) {
        if (err) return reply.send(err);
  
        client.query(
          'DELETE FROM cliente WHERE cliente_id = ?',
          [id],
          function onResult(err, result) {
            client.release();
            reply.send(err || result);
          }
        );
      }
    } catch (err) {
      handleError(err, reply, 'Error deleting client')
    }
  });

  fastify.post('/clientes', (req, reply) => {
    try {
      const {
        nome,
        cpf,
        email,
        telefone,
        data_nascimento,
        endereco_id,
        username, 
        senha
      } = req.body;
  
      if (!endereco_id || !cpf) {
        reply.code(400).send('CPF e endereço são campos obrigatórios para criar um cliente.');
        return;
      }
  
      fastify.mysql.getConnection(onConnect);

      function onConnect(err, client) {
        if (err) return reply.send(err);

        const fieldValues = [];
        if(req.body) {
          Object.entries(req.body).forEach(([key, value]) => {
            fieldValues.push(value);
          });
        }

        if(fieldValues.length === 0) {
          client.release();
          reply.code(400).send('No fields provided for insert.');
          return;
        }
        
        const sql =
          `INSERT INTO cliente (nome, cpf, email, telefone, data_nascimento, endereco_id, username, senha)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        client.query(sql, fieldValues, function onResult(err, result) {
          client.release();
          reply.send(err || result);
        });
        }
    } catch (err) {
      reply.code(500).send('Error creating client:', err.message);
    }
  });
}

function isValidId(id) {
  return /^[0-9]+$/.test(id);
}

module.exports = routes