const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'radyn123',
  database: 'radyn',
  port: '3306'
})

connection.connect()

module.exports = connection
