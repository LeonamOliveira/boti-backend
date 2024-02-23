require('dotenv').config();

const fastify = require('fastify')({
  logger: true
})

fastify.register(require('@fastify/mysql'), {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
})

fastify.register(require('@fastify/cors'), {
  origin: true,
})

fastify.register(require('./routes/categorias'))
fastify.register(require('./routes/clientes'))
fastify.register(require('./routes/enderecos'))
fastify.register(require('./routes/pedidos'))
fastify.register(require('./routes/produtoPedido'))
fastify.register(require('./routes/produtos'))


fastify.listen({ port: 3001 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})