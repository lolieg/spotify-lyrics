import express from 'express'
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()
const musicApi = require('NeteaseCloudMusicApi')

app.use(bodyParser.json())

app.get('/getSong', async (req: express.Request, res: express.Response) => {
  let lrc = null
  try {
    const artists = await musicApi.cloudsearch({
      keywords: `${req.query.artistName}`,
      type: 100,
    })
    const songs = await musicApi.artist_songs({
      id: artists.body.result.artists[0].id,
      limit: 5000,
    })
    let id = null
    for (const song of songs.body.songs) {
      const songName = req.query.songName as string
      if (
        song.name.toLowerCase().replace(/\W/g, '') ===
        songName.toLowerCase().replace(/\W/g, '')
      ) {
        id = song.id
        break
      }
    }
    const lyrics = await musicApi.lyric({
      id,
    })
    lrc = lyrics.body.lrc.lyric
  } catch (e) {
    try {
      const songs = await musicApi.cloudsearch({
        keywords: `${req.query.artistName} ${req.query.songName}`,
      })
      const lyrics = await musicApi.lyric({
        id: songs.body.result.songs[0].id,
      })
      lrc = lyrics.body.lrc.lyric
    } catch (e) {
      lrc = null
    }
    // console.log(e)
  }
  res.json({ lrc })
})
module.exports = app
