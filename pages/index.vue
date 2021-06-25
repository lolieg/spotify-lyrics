<template>
  <div class="mainContainer">
    <client-only>
      <three :song-speed="songSpeed"></three>
    </client-only>
    <section
      id="section"
      :style="{ visibility: loaded ? 'visible' : 'hidden' }"
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
      <div
        class="divider listenTogetherDivider"
        @click="foldSection('listenTogether')"
      >
        Listen Together
      </div>
      <div v-if="listenTogether" class="listenTogether">
        <synced-player
          ref="syncedPlayer"
          :spotify-api="spotifyApi"
          :socket="socket"
          :song-id="songId"
          :progress="progress"
          @update="update()"
        ></synced-player>
      </div>

      <div
        class="divider lyricsAndPlayerDivider"
        @click="foldSection('lyricsAndPlayer')"
      >
        Lyrics & Player
      </div>
      <div v-if="lyricsAndPlayer" class="lyricsAndPlayer">
        <div v-if="$auth.loggedIn && $auth.user.is_playing">
          <div class="content has-text-centered animateChange">
            <h3>
              {{ $auth.user.item.name }} - {{ $auth.user.item.artists[0].name }}
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
import Vue from 'vue'
import SpotifyApi from 'spotify-web-api-node'
import { Oauth2Scheme } from '@nuxtjs/auth-next'
import Three from '~/components/Three.vue'
import SyncedPlayer from '~/components/SyncedPlayer.vue'

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
      listenTogether: true,
      lyricsAndPlayer: true,
      updater,
      genres,
      spotifyApi,
      socket,
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
    if (this.$auth.loggedIn) {
      const strategy = this.$auth.strategy as Oauth2Scheme
      this.spotifyApi.setAccessToken(
        (strategy.token.get() as string).replace('Bearer ', '')
      )
      if (this.$auth.user.is_playing) {
        this.getGenre()
        this.getSpeed()
      }
    }

    await this.update()

    setInterval(async () => {
      if (!this.$auth.loggedIn) {
        this.loaded = true
        this.$auth.refreshTokens()
        return
      }
      try {
        const songBefore = this.$auth.user?.item?.id
        await this.$auth.fetchUser()
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
      this.update()
    }, 2000)
    const duration = 350
    this.timeline = this.$anime
      .timeline({
        easing: 'easeInOutQuad',
        duration,
      })
      .add({
        targets: '.authBtns',
        opacity: ['0%', '100%'],
        delay: 3000,
      })
      .add({
        targets: '.listenTogetherDivider',
        opacity: ['0%', '100%'],
      })
      .add(
        {
          targets: '.listenTogetherDivider',
          marginRight: ['45%', '0%'],
          marginLeft: ['45%', '0%'],
          duration: duration * 2,
        },
        `-=${duration}`
      )
      .add({
        targets: '.listenTogether',
        opacity: ['0%', '100%'],
        translateY: [-30, 0],
      })
      .add({
        targets: '.lyricsAndPlayerDivider',
        opacity: ['0%', '100%'],
      })
      .add(
        {
          targets: '.lyricsAndPlayerDivider',
          marginRight: ['45%', '0%'],
          marginLeft: ['45%', '0%'],
          duration: duration * 2,
        },
        `-=${duration}`
      )
      .add({
        targets: '.lyricsAndPlayer',
        opacity: ['0%', '100%'],
        translateY: [-30, 0],
      })
  },
  methods: {
    foldSection(name: string) {
      // @ts-ignore
      this[name] = !this[name]
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
    async update() {
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
            this.update()
            return
          }
          this.progress += 100
        }, 100)
      }
    },
    login() {
      this.$auth.loginWith('spotify', { params: { Authorization: 'value' } })
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
.authBtns {
  margin-top: 2vh;
  margin-bottom: 2vh;
  display: grid;
  place-items: center;
}
.divider:hover {
  cursor: pointer;
}
.divider {
  color: #04ffff;
}
</style>
