const express = require('express')
const bodyParser = require('body-parser')
const app = express()
// const lyricsFinder = require('lyrics-finder')
const axios = require('axios')
require('dotenv').config()

app.use(bodyParser.json())

app.get('/getSong', (req, res) => {
  // const song =
  //   (await lyricsFinder(req.query.songName, req.query.artistName)) ||
  //   'Not Found'
  axios
    .get(
      `https://api.textyl.co/api/lyrics?q=${req.query.songName} ${req.query.artistName}`,
      { timeout: 3000 }
    )
    .then((r) => {
      if (r.status === 200) {
        res.json({ lrc: r.data })
      } else {
        res.json({ lrc: null })
      }
    })
    .catch((r) => res.json({ lrc: null }))
})
module.exports = app
