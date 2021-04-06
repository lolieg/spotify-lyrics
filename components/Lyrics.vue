<template>
  <b-loading v-if="!fetched" active></b-loading>
  <div v-else class="lyrics content has-text-centered">
    <div v-for="line in lyrics" :key="lyrics.indexOf(line)">
      <h1 v-if="!line.lit && line.visible" style="color: green">
        {{ line.lyrics }}
      </h1>
      <h1 v-else-if="line.visible">{{ line.lyrics }}</h1>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    songName: {
      type: String,
      required: true,
    },
    artistName: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      lines: [],
      fetched: false,
    }
  },
  computed: {
    lyrics() {
      if (this.lines[0].notFound !== undefined) {
        return this.lines
      }
      const lyrics = [...this.lines]
      lyrics.map((line, index, array) => {
        let next = array[index + 5]
        if (next === undefined) {
          next = { seconds: 999 }
        }
        if (
          this.progress / 1000 >= line.seconds - 4 &&
          this.progress / 1000 < next.seconds - 4
        ) {
          line.visible = true
          if (
            this.progress / 1000 >= line.seconds + 4 &&
            this.progress / 1000 < next.seconds + 4
          ) {
            line.lit = true
          }
        } else {
          line.visible = false
        }

        return line
        // let next = index + 3
        // if (next + 1 > array.length) {
        //   next -= 1
        // }
        // if (
        //   line &&
        //   array[next] &&
        //   line.seconds - 2 < this.progress &&
        //   array[next].seconds - 2 > this.progress
        // ) {
        //   line.lit = true
        //   line.visible = true
        // } else {
        //   line.lit = false
        //   line.visible = false
        // }
        // return line
      })
      return lyrics
    },
  },
  watch: {
    async songName() {
      await this.getSong()
    },
  },
  async mounted() {
    await this.getSong()
  },
  methods: {
    async getSong() {
      this.fetched = false
      this.lines = []
      const unformattedLyrics = await this.$axios.$get(
        `/api/getSong?songName=${this.songName}&artistName=${this.artistName}`
      )
      if (unformattedLyrics.lrc === null) {
        this.lines.push({
          notFound: true,
          lyrics: 'No Lyrics Found',
          lit: true,
          visible: true,
        })
      } else {
        unformattedLyrics.lrc.map((el) =>
          Object.assign(el, { lit: false, visible: false })
        )
        this.lines.push(...unformattedLyrics.lrc)
      }

      this.fetched = true
    },
  },
}
</script>
<style scoped>
.lyrics {
  white-space: pre;
  max-height: 10vh;
}
.content {
  font-size: 3vh;
}
</style>
