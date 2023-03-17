const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'radyn123',
  database: 'website',
  port: '3306'
})

connection.connect()

module.exports = connection
