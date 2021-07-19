<template>
  <div>
    <div v-if="!fetched" class="is-relative some-wrapper" style="height: 25vh">
      <b-loading active :is-full-page="false"></b-loading>
    </div>
    <div v-else class="content has-text-centered">
      <div
        v-if="!noLrc"
        class="container"
        style="margin-right: 30vw; margin-left: 30vw"
      >
        <b-button style="margin-bottom: 10px" @click="noLrc = true"
          >Wrong Lyrics</b-button
        >
        <h6>Offset</h6>
        <b-slider
          v-model="offset"
          size="is-medium"
          :min="-3"
          :max="3"
          :step="0.5"
          ticks
        ></b-slider>
      </div>
      <h1
        v-if="runner != null && !noLrc && runner.curIndex() >= 1"
        class="transparent"
      >
        {{ runner.getLyric(runner.curIndex() - 1).content }}
      </h1>
      <h1
        v-if="runner != null && !noLrc && runner.curIndex() >= 0"
        class="normal"
      >
        {{ runner.curLyric().content }}
      </h1>
      <div v-else-if="noLrc">
        <h1>No Lyrics Found!</h1>
        <div class="container has-text-centered">
          <div class="columns">
            <div class="column"></div>
            <div class="column">
              <b-tooltip
                label="Find lyrics with a better search query than the title of the actual song"
              >
                <b-field label="Custom Search">
                  <b-field style="margin: 10px" label="Song">
                    <b-input
                      v-model="customSongName"
                      placeholder="Perfect"
                      @keyup.native.enter="getSong(true)"
                    ></b-input>
                  </b-field>
                  <b-field style="margin: 10px" label="Artist (optional)">
                    <b-input
                      v-model="customArtistName"
                      placeholder="Ed Sheeran"
                      @keyup.native.enter="getSong(true)"
                    ></b-input>
                  </b-field>
                </b-field>
              </b-tooltip>

              <b-button style="margin: 10px" @click="getSong(true)"
                >Search for Lyrics</b-button
              >
            </div>
            <div class="column"></div>
          </div>
        </div>
      </div>
      <h1
        v-if="
          runner != null &&
          !noLrc &&
          runner.curIndex() >= 0 &&
          runner.curIndex() + 1 < lrc.lyrics.length
        "
        class="transparent"
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
      noLrc: true,
      lrc: null,
      runner: new Runner(),
      fetched: false,
      customSongName: '',
      customArtistName: '',
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
  computed: {
    lrcText() {
      return this.$store.state.lrcText
    },
    offset: {
      get() {
        return this.$store.state.offset
      },
      set(value) {
        this.$store.commit('setOffset', value)
      },
    },
  },
  watch: {
    async songName() {
      // this.offset = 0
      await this.getSong()
      this.customSongName = ''
      this.customArtistName = ''
    },
    progress() {
      if (this.runner !== null) {
        this.runner.timeUpdate(this.progress / 1000 + 1.5 + this.offset)
      }
    },
  },
  async mounted() {
    if (this.lrcText === null || this.$store.state.songName !== this.songName) {
      return await this.getSong()
    }
    this.setRunner()
    this.fetched = true
    this.noLrc = false
  },
  methods: {
    async getSong(custom = false) {
      this.fetched = false
      this.noLrc = true
      this.$store.commit('setSongName', this.songName)
      this.$store.commit('changeLrc', null)
      let lrcText = null
      if (custom) {
        lrcText = await this.$axios.$get(
          `/api/getSong?songName=${this.customSongName}&artistName=${this.customArtistName}`
        )
      } else {
        lrcText = await this.$axios.$get(
          `/api/getSong?songName=${this.songName}&artistName=${this.artistName}`
        )
      }

      if (lrcText.lrc !== null) {
        this.noLrc = false
      }
      if (this.noLrc) {
        this.fetched = true
        return
      }
      if (lrcText.lrc !== null) {
        this.$store.commit('changeLrc', lrcText.lrc)
        this.$store.commit('setSongName', this.songName)
      }

      this.setRunner()
      this.fetched = true
    },
    setRunner() {
      try {
        this.lrc = Lrc.parse(this.lrcText)
      } catch (e) {
        this.setRunner()
      }

      if (this.runner !== null) {
        this.runner.setLrc(this.lrc)
        this.runner.lrcUpdate()
        this.runner.timeUpdate(this.progress / 1000 + this.offset)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.content {
  font-size: 3vh;
}
.normal {
  font-weight: bold;
  background: linear-gradient(45deg, #00c9ff 0%, #50f760 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-bottom: 0.2em;
  margin-bottom: -0.2em;
}
.transparent {
  background: linear-gradient(
    45deg,
    rgba(0, 201, 255, 0.2) 0%,
    rgba(80, 247, 96, 0.2) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-bottom: 0.2em;
  margin-bottom: -0.2em;
}
.transparent:hover {
  background: linear-gradient(90deg, #dda3ff 0%, #63ffff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-bottom: 0.2em;
  margin-bottom: -0.2em;
}
</style>
