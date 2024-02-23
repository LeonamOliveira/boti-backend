async function routes(fastify, options) {
  const handleError = (err, reply, customMessage) => {
    fastify.log.error(`Error: ${customMessage || err.message}`);
    reply.code(500).send(`Error: ${customMessage || err.message}`);
  }

  fastify.get('/categorias', (req, reply) => {
    try { 
      fastify.mysql.getConnection(onConnect)
    
      function onConnect (err, client) {
        if (err) return reply.send(err)
        
        const sqlQuery = 'SELECT * FROM categoria';

        client.query(sqlQuery, function onResult (err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      }
    } catch (err) {
      handleError(err, reply, 'Error fetching categorias')
    }
  })


  fastify.get('/categorias/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid category ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        const fieldValues = [id];
        const sqlQuery = 'SELECT * FROM categoria WHERE categoria_id = ?';

        client.query(sqlQuery, fieldValues, function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      } 
    } catch (err) {
        handleError(err, reply, 'Error fetching category')
      }
    });

  fastify.put('/categorias/:id', (req, reply) => {
    const { id } = req.params;
    const { nome_categoria, descricao_categoria } = req.body;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid category ID. Please provide a valid numeric ID.');
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

        const sql = 
        `UPDATE categoria SET ${updateFields.join(', ')} WHERE categoria_id = ${id}`;

        fieldValues.push(id);

        client.query(sql, fieldValues, function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      } 
    } catch (err) {
        reply.code(500).send('Error updating category:', err);
        throw err; 
      }
    });

  fastify.post('/categorias', (req, reply) => {
    const { nome_categoria, descricao_categoria } = req.body;

    try {
      if (!nome_categoria) {
        reply.code(400).send('Category name is required.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        const fieldValues = [nome_categoria, descricao_categoria];
        const sqlQuery = 'INSERT INTO categoria (nome_categoria, descricao_categoria) VALUES (?, ?)';

        client.query(sqlQuery, fieldValues, function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      } 
    } catch (err) {
        handleError(err, reply, 'Error creating category')
      }
    });

  fastify.delete('/categorias/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid category ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        const sqlQuery = 'DELETE FROM categoria WHERE categoria_id = ?';

        client.query(sqlQuery, [id], function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      } 
    } catch (err) {
        handleError(err, reply, 'Error deleting category')
      }
  });
}

function isValidId(id) {
  return /^[0-9]+$/.test(id);
}

module.exports = routes