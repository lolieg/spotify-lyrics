<template>
  <div>
    <div v-if="!fetched" class="is-relative some-wrapper" style="height: 25vh">
      <b-loading active :is-full-page="false"></b-loading>
    </div>
    <div v-else class="content has-text-centered">
      <h1
        v-if="runner != null && !noLrc && runner.curIndex() >= 1"
        class="trans"
      >
        {{ runner.getLyric(runner.curIndex() - 1).content }}
      </h1>
      <h1
        v-if="runner != null && !noLrc && runner.curIndex() >= 0"
        style="font-weight: bold; color: green"
      >
        {{ runner.curLyric().content }}
      </h1>
      <h1 v-else-if="noLrc" style="color: white">No Lyrics Found!</h1>
      <h1
        v-if="
          runner != null &&
          !noLrc &&
          runner.curIndex() >= 0 &&
          runner.curIndex() + 1 < lrc.lyrics.length
        "
        class="trans"
      >
        {{ runner.getLyric(runner.curIndex() + 1).content }}
      </h1>
    </div>
  </div>
</template>
<script>
import { Lrc, Runner } from 'lrc-kit'
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
      lrc: null,
      noLrc: true,
      runner: new Runner(),
      fetched: false,
    }
  },
  // computed: {
  //   lyrics() {
  //     if (this.lines[0].notFound !== undefined) {
  //       return this.lines
  //     }
  //     const lyrics = [...this.lines]
  //     lyrics.map((line, index, array) => {
  //       let next = array[index + 5]
  //       if (next === undefined) {
  //         next = { seconds: 999 }
  //       }
  //       if (
  //         this.progress / 1000 >= line.seconds - 4 &&
  //         this.progress / 1000 < next.seconds - 4
  //       ) {
  //         line.visible = true
  //         if (
  //           this.progress / 1000 >= line.seconds + 4 &&
  //           this.progress / 1000 < next.seconds + 4
  //         ) {
  //           line.lit = true
  //         }
  //       } else {
  //         line.visible = false
  //       }

  //       return line
  //       // let next = index + 3
  //       // if (next + 1 > array.length) {
  //       //   next -= 1
  //       // }
  //       // if (
  //       //   line &&
  //       //   array[next] &&
  //       //   line.seconds - 2 < this.progress &&
  //       //   array[next].seconds - 2 > this.progress
  //       // ) {
  //       //   line.lit = true
  //       //   line.visible = true
  //       // } else {
  //       //   line.lit = false
  //       //   line.visible = false
  //       // }
  //       // return line
  //     })
  //     return lyrics
  //   },
  // },
  watch: {
    async songName() {
      await this.getSong()
      // eslint-disable-next-line no-unused-vars
      // const n = new Notification(this.$auth.user.item.name, {
      //   body: this.lrc.toString(),
      //   silent: true,
      // })
    },
    progress() {
      if (this.runner === null) {
        return
      }
      this.runner.timeUpdate(this.progress / 1000)
    },
  },
  async mounted() {
    await this.getSong()
  },
  methods: {
    async getSong() {
      this.fetched = false
      this.noLrc = true
      const lrcText = await this.$axios.$get(
        `/api/getSong?songName=${this.songName}&artistName=${this.artistName}`
      )
      if (lrcText.lrc !== null) {
        this.noLrc = false
      }
      if (this.noLrc) {
        this.fetched = true
        return
      }
      this.lrc = Lrc.parse(lrcText.lrc)
      if (this.runner !== null) {
        this.runner.setLrc(this.lrc)
        this.runner.lrcUpdate()
        this.runner.timeUpdate(this.progress / 1000)
      }
      this.fetched = true
      // this.lines = []
      // const unformattedLyrics = await this.$axios.$get(
      //   `/api/getSong?songName=${this.songName}&artistName=${this.artistName}`
      // )
      // if (unformattedLyrics.lrc === null) {
      //   this.lines.push({
      //     notFound: true,
      //     lyrics: 'No Lyrics Found',
      //     lit: true,
      //     visible: true,
      //   })
      // } else {
      //   unformattedLyrics.lrc.map((el) =>
      //     Object.assign(el, { lit: false, visible: false })
      //   )
      //   this.lines.push(...unformattedLyrics.lrc)
      // }
    },
  },
}
</script>
<style scoped>
.content {
  font-size: 3vh;
}
.trans {
  font-weight: bold;
  color: rgba(255, 255, 255, 0.2);
}
</style>
