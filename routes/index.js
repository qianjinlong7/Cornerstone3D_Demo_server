var express = require('express')
var router = express.Router()
const connection = require('../db/db_connect')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.post('/getPosition', (req, res) => {
  const { curPage, pageSize } = req.body
  const low = (curPage - 1) * pageSize
  const SQLstr = 'SELECT * from position order by positionNo limit ' + low + "," + pageSize

  connection.query(SQLstr, (error, results) => {
    if (!error) {
      console.log(results)
      res.send(results)
    } else {
      throw error
    }
  })
})

module.exports = router;
