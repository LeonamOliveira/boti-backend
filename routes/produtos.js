async function routes(fastify, options) {
  const handleError = (err, reply, customMessage) => {
    fastify.log.error(`Error: ${customMessage || err.message}`);
    reply.code(500).send(`Error: ${customMessage || err.message}`);
  }

  fastify.get('/produtos', (req, reply) => {
    try { 
      fastify.mysql.getConnection(onConnect)
    
      function onConnect (err, client) {
        if (err) return reply.send(err)
        
        const sqlQuery = `SELECT 
          produto_id, nome_produto, descricao_produto, preco_produto, qtd_estoque, DATE_FORMAT(data_cadastro_produto, '%d/%m/%Y') as data_cadastro_produto, categoria_id, imagem
        FROM produto`;

        client.query(sqlQuery, function onResult (err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      }
    } catch (err) {
      handleError(err, reply, 'Error fetching produtos')
    }
  })


  fastify.get('/produtos/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid product ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        client.query(
          `SELECT * FROM produto WHERE produto_id = ${id}`,
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

  fastify.put('/produtos/:id', (req, reply) => {
    const { id } = req.params;
    const { nome_produto, descricao_produto, preco_produto, qtd_estoque, data_cadastro_produto, categoria_id, imagem } = req.body;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid product ID. Please provide a valid numeric ID.');
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

        const sql = `UPDATE produto SET ${updateFields.join(', ')} WHERE produto_id = ${id}`;

        client.query(sql, fieldValues, function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      }
    } catch (error) {
      reply.code(500).send('Error updating product:', err);
      throw err; 
    }
  });

  fastify.post('/produtos', (req, reply) => {
    const { nome_produto, descricao_produto, preco_produto, qtd_estoque, data_cadastro_produto, categoria_id, imagem } = req.body;

    try {
      if(!categoria_id) {
        reply.code(400).send('Invalid category ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        const fieldValues = [nome_produto, descricao_produto, preco_produto, qtd_estoque, data_cadastro_produto, categoria_id, imagem];
        const sqlQuery = `
          INSERT INTO produto (nome_produto, descricao_produto, preco_produto, qtd_estoque, data_cadastro_produto, categoria_id, imagem) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`;
        client.query(sqlQuery, fieldValues, function onResult(err, result) {
            client.release()
            reply.send(err || result)
        })
      }
    } catch (err) {
      handleError(err, reply, 'Error creating product')
    }
  });

  fastify.delete('/produtos/:id', (req, reply) => {
    const { id } = req.params;

    try {
      if (!isValidId(id)) {
        reply.code(400).send('Invalid product ID. Please provide a valid numeric ID.');
        return;
      }

      fastify.mysql.getConnection(onConnect)

      function onConnect(err, client) {
        if (err) return reply.send(err)

        const sqlQuery =  'DELETE FROM produto WHERE produto_id = ?';

        client.query(sqlQuery, [id], function onResult(err, result) {
            client.release()
            reply.send(err || result)
          }
        )
      }
    } catch (err) {
      handleError(err, reply, 'Error deleting product')
    }
  });
}

function isValidId(id) {
  return /^[0-9]+$/.test(id);
}

module.exports = routes