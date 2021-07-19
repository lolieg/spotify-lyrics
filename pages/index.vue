<template>
  <div class="mainContainer">
    <client-only>
      <three v-if="!state.performanceMode" :song-speed="songSpeed"></three>
    </client-only>
    <section
      id="section"
      :style="{ visibility: loaded ? 'visible' : 'hidden' }"
    >
      <div class="divider infoTextDivider" @click="foldSection('infoText')">
        <b-tooltip
          style="text-transform: capitalize"
          label="Click me to fold section"
          position="is-bottom"
          >Info</b-tooltip
        >
      </div>
      <div v-if="state.infoText" class="infoText content has-text-centered">
        <h1>Spotify Lyrics</h1>
        <p>
          Log in to Display the Lyrics of the song you are listening to and
          Listen Together with your friends.
        </p>
        <b-button
          style="margin-bottom: 10px"
          @click="changePerformanceMode()"
          >{{
            state.performanceMode
              ? 'Disable Performance Mode'
              : 'Enable Performance Mode'
          }}</b-button
        >
        <div class="authBtns">
          <b-tooltip
            label="Start playing a song if you can't log in!"
            position="is-bottom"
            ><b-button v-if="!$auth.loggedIn" @click="login()"
              >Login</b-button
            ></b-tooltip
          >
          <b-button v-if="$auth.loggedIn" @click="logout()">Logout</b-button>
        </div>
      </div>

      <div
        class="divider listenTogetherDivider"
        @click="foldSection('listenTogether')"
      >
        <b-tooltip
          style="text-transform: capitalize"
          label="Click me to fold section"
          position="is-bottom"
          >Listen Together</b-tooltip
        >
      </div>
      <div v-if="state.listenTogether" class="listenTogether">
        <synced-player
          ref="syncedPlayer"
          :spotify-api="spotifyApi"
          :socket="socket"
          :song-id="songId"
          :progress="progress"
          @update="updateProgress()"
        ></synced-player>
      </div>

      <div class="divider playerDivider" @click="foldSection('player')">
        <b-tooltip
          style="text-transform: capitalize"
          label="Click me to fold section"
          position="is-bottom"
          >Player</b-tooltip
        >
      </div>
      <div v-if="state.player" class="player">
        <div v-if="$auth.loggedIn">
          <div class="content has-text-centered animateChange">
            <h3
              v-if="
                $auth.user.item.name !== null &&
                $auth.user.item.artists[0].name !== null
              "
            >
              {{ $auth.user.item.name }} -
              {{ $auth.user.item.artists[0].name }}
            </h3>
            <h4 v-if="genres.length > 0">
              Artist Genres: <br />
              {{ genres.join(', ') }}
            </h4>
          </div>
          <b-progress
            id="songProgress"
            :value="(progress / $auth.user.item.duration_ms) * 100"
            show-value
            class="animateChange"
            size="is-large"
            type="is-success"
            >{{ progressTime }}</b-progress
          >
          <!-- <div class="container"> -->
          <div class="columns is-gapless is-centered">
            <div class="column is-1 has-text-centered">
              <b-button :disabled="!skipPreviousButton" @click="skipPrevious()"
                ><b-icon icon="skip-previous"></b-icon
              ></b-button>
            </div>
            <div class="column is-1 has-text-centered">
              <b-button
                :disabled="!togglePlayingButton"
                @click="togglePlaying()"
                ><b-icon
                  :icon="$auth.user.is_playing ? 'pause' : 'play'"
                ></b-icon
              ></b-button>
            </div>
            <div class="column is-1 has-text-centered">
              <b-button :disabled="!skipNextButton" @click="skipNext()"
                ><b-icon icon="skip-next"></b-icon
              ></b-button>
            </div>
          </div>
        </div>
        <!-- </div> -->
        <h1 v-else class="has-text-centered">No Player Running</h1>
      </div>

      <div class="divider lyricsDivider" @click="foldSection('lyrics')">
        <b-tooltip
          style="text-transform: capitalize"
          label="Click me to fold section"
          position="is-bottom"
          >Lyrics</b-tooltip
        >
      </div>
      <div v-if="state.lyrics" class="lyrics">
        <div v-if="$auth.loggedIn && $auth.user.is_playing">
          <Lyrics
            :song-name="songName"
            :artist-name="$auth.user.item.artists[0].name"
            :progress="progress"
          ></Lyrics>
        </div>
        <h1
          v-else-if="!$auth.loggedIn"
          class="has-text-centered"
          style="font-size: 2vh"
        >
          Not Logged In.
        </h1>
        <h1 v-else class="has-text-centered" style="font-size: 2vh">
          Not Playing Music on Spotify
        </h1>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Oauth2Scheme } from '@nuxtjs/auth-next'
import SpotifyApi from 'spotify-web-api-node'
import Vue from 'vue'
import SyncedPlayer from '~/components/SyncedPlayer.vue'
import Three from '~/components/Three.vue'

export default Vue.extend({
  components: { Three, SyncedPlayer },
  data() {
    const spotifyApi: SpotifyApi = new SpotifyApi()
    const socket = this.$nuxtSocket({
      channel: '/',
      persist: true,
    })
    const genres: string[] = []
    const updater = setInterval(() => {}, 10000)
    const timeline: any = null
    return {
      loaded: false,
      timeline,
      progress: 0,
      songSpeed: 100,
      updater,
      genres,
      spotifyApi,
      socket,
      skipPreviousButton: true,
      togglePlayingButton: true,
      skipNextButton: true,
    }
  },
  computed: {
    songName() {
      return this.$auth.user?.item?.name ?? ''
    },
    songId() {
      if (this.$auth.loggedIn && this.$auth.user.is_playing) {
        return this.$auth.user?.item?.uri ?? ''
      }
      return ''
    },
    progressTime() {
      const date = new Date(0)
      date.setSeconds(this.progress / 1000) // specify value for SECONDS here
      const timeString = date.toISOString().substr(14, 5)

      const date1 = new Date(0)
      date1.setSeconds((this.$auth.user?.item?.duration_ms ?? 0) / 1000) // specify value for SECONDS here
      const timeString1 = date1.toISOString().substr(14, 5)

      return timeString + ' / ' + timeString1
    },
    state() {
      return this.$store.state
    },
  },
  watch: {
    songName() {
      this.animateChange()
    },
    loaded() {
      if (this.loaded) {
        this.timeline.play()
      }
    },
  },
  async mounted() {
    const strategy = this.$auth.strategy as Oauth2Scheme
    if (strategy.token.status().valid()) {
      this.spotifyApi.setAccessToken(
        (strategy.token.get() as string)?.replace('Bearer ', '')
      )
    }
    if (this.$auth.loggedIn) {
      if (this.$auth.user.is_playing) {
        this.getGenre()
        this.getSpeed()
      }
    }
    this.setTimeline()
    await this.update(strategy)

    setInterval(async () => {
      await this.update(strategy)
    }, 2000)
  },
  methods: {
    foldSection(name: string) {
      // // @ts-ignore
      // this[name] = !this[name]
      this.$store.commit('toggle', name)
    },
    setTimeline() {
      const duration = 350
      const sections = ['infoText', 'listenTogether', 'player', 'lyrics']
      const timeline = this.$anime.timeline({
        easing: 'easeInOutQuad',
        duration,
        autoplay: false,
      })

      for (const section of sections) {
        timeline
          .add({
            targets: `.${section}Divider`,
            opacity: ['0%', '100%'],
            delay: 0,
          })
          .add(
            {
              targets: `.${section}Divider`,
              marginRight: ['45%', '0%'],
              marginLeft: ['45%', '0%'],
              duration: duration * 2,
            },
            `-=${duration}`
          )
          .add({
            targets: `.${section}`,
            opacity: ['0%', '100%'],
          })
      }
      this.timeline = timeline
    },
    animateChange() {
      this.$anime({
        targets: '.animateChange',
        easing: 'easeInOutQuad',
        opacity: ['100%', '0%'],
        duration: 100,
        changeComplete: () =>
          this.$anime({
            targets: '.animateChange',
            easing: 'easeInOutQuad',
            opacity: ['0%', '100%'],
            duration: 2000,
          }),
      })
    },
    getSpeed() {
      this.spotifyApi
        .getAudioAnalysisForTrack(this.$auth.user?.item?.id ?? '')
        .then((resp: any) => (this.songSpeed = resp.body.track.tempo))
    },
    getGenre() {
      const artistId = (this.$auth.user?.item as SpotifyApi.TrackObjectFull)
        .artists[0]?.id
      this.spotifyApi
        .getArtist(artistId)
        .then((resp) => (this.genres = resp.body.genres))
    },
    async update(strategy: Oauth2Scheme) {
      // console.log(this.$auth.user)
      // console.log(this.$auth.loggedIn)
      if (this.spotifyApi.getAccessToken() === undefined) {
        if (strategy.token.status().valid()) {
          this.spotifyApi.setAccessToken(
            (strategy.token.get() as string)?.replace('Bearer ', '')
          )
        } else if (strategy.token.status().expired()) {
          await this.$auth.refreshTokens()
        }
      }
      this.spotifyApi.getMyCurrentPlaybackState().then((resp) => {
        this.$auth.setUser(resp.body)
      })
      if (!this.$auth.loggedIn) {
        this.loaded = true
        return
      }

      try {
        const songBefore = this.$auth.user?.item?.id
        if (
          songBefore !== this.$auth.user?.item?.id &&
          this.$auth.user.is_playing
        ) {
          this.getGenre()
          this.getSpeed()
        }
      } catch (e) {
        this.logout()
      }
      this.loaded = true
      await this.updateProgress()
    },
    async updateProgress() {
      if (!this.$auth.loggedIn) {
        return
      }
      const syncedPlayer: InstanceType<typeof SyncedPlayer> = this.$refs
        .syncedPlayer as InstanceType<typeof SyncedPlayer>
      const progress = this.$auth.user?.progress_ms ?? 0
      if (syncedPlayer !== undefined && this.progress !== 0) {
        if (this.progress + 3000 < progress) {
          await syncedPlayer.seeked(progress)
        }
        if (this.progress - 3000 > progress) {
          await syncedPlayer.seeked(progress)
        }
      }

      this.progress = this.$auth.user.progress_ms ?? this.progress
      if (this.$auth.user.is_playing) {
        clearInterval(this.updater)
        this.updater = setInterval(() => {
          if (this.progress >= (this.$auth.user?.item?.duration_ms ?? 0)) {
            clearInterval(this.updater)
            this.updateProgress()
            return
          }
          if (this.$auth.user.is_playing) {
            this.progress += 100
          }
        }, 100)
      }
    },
    async skipPrevious() {
      this.skipPreviousButton = false
      try {
        await this.spotifyApi.skipToPrevious()
      } catch (e) {}
      setTimeout(() => (this.skipPreviousButton = true), 1000)
    },
    async togglePlaying() {
      this.togglePlayingButton = false
      try {
        if (this.$auth.user.is_playing) {
          await this.spotifyApi.pause()
        } else {
          await this.spotifyApi.play()
        }
      } catch (e) {}

      setTimeout(() => (this.togglePlayingButton = true), 1000)
    },
    async skipNext() {
      this.skipNextButton = false
      try {
        await this.spotifyApi.skipToNext()
      } catch (e) {}
      setTimeout(() => (this.skipNextButton = true), 1000)
    },
    changePerformanceMode() {
      this.$store.commit('toggle', 'performanceMode')
    },
    login() {
      this.$auth.loginWith('spotify')
    },
    logout() {
      this.$auth.logout()
    },
  },
})
</script>
<style lang="scss" scoped>
#songProgress {
  margin-left: 10vh;
  margin-right: 10vh;
}
#section {
  position: absolute;
  width: 100%;
  height: 100%;
}
.divider:hover {
  cursor: pointer;
}
.divider {
  color: #04ffff;
}
</style>
