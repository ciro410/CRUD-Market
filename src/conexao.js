const knex = require('knex')({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: '24271731',
        database: 'market'
    }
});

module.exports = knex;