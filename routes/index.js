var express = require('express')
var router = express.Router()
const connection = require('../db/db_connect')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/getPosition', (req, res) => {
  const SQLstr = 'SELECT * FROM position ORDER BY positionNo;'

  connection.query(SQLstr, (error, results) => {
    if (!error) {
      res.send(results)
    } else {
      throw error
    }
  })
})

router.post('/getMedia', (req, res) => {
  const { curPage, pageSize } = req.body
  const low = (curPage - 1) * pageSize
  const SQLstr1 = 'SELECT * FROM media ORDER BY mediaNo DESC LIMIT ' + low + "," + pageSize + ';'
  const SQLstr2 = 'SELECT * FROM media;'
  const data = []

  connection.query(SQLstr1, (error, results) => {
    if (!error) {
      data.push(results)
      connection.query(SQLstr2, (error, results) => {
        if (!error) {
          data.push(results.length)
          res.send(data)
        } else {
          throw error
        }
      })
    } else {
      throw error
    }
  })

})

module.exports = router;
