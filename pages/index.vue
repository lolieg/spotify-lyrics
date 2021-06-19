<template>
  <div class="mainContainer">
    <three></three>
    <section id="section">
      <div class="authBtns">
        <b-button v-if="!$auth.loggedIn" @click="login()">Login</b-button>
        <b-button v-if="$auth.loggedIn" @click="logout()">Logout</b-button>
      </div>
      <div class="divider">Listen Together</div>
      <synced-player
        ref="syncedPlayer"
        :spotify-api="spotifyApi"
        :socket="socket"
        :song-id="songId"
        :progress="progress"
        @update="update()"
      ></synced-player>
      <div class="divider">Lyrics & Player</div>
      <div v-if="$auth.loggedIn && $auth.user.is_playing">
        <div class="content has-text-centered">
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
          size="is-large"
          >{{ progressTime }}</b-progress
        >
        <Lyrics
          :song-name="$auth.user.item.name"
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
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import SpotifyWebApi from 'spotify-web-api-node'
import Three from '~/components/Three.vue'
import SyncedPlayer from '~/components/SyncedPlayer.vue'

export default Vue.extend({
  components: { Three, SyncedPlayer },
  data() {
    const spotifyApi: SpotifyWebApi = new SpotifyWebApi()
    const socket = this.$nuxtSocket({
      channel: '/',
      persist: true,
    })
    const genres: string[] = []
    const updater = setInterval(() => {}, 10000)
    return {
      progress: 0,
      updater,
      genres,
      spotifyApi,
      socket,
    }
  },
  computed: {
    songId() {
      if (this.$auth.loggedIn) {
        // @ts-ignore
        return this.$auth.user.item.uri
      }
      return ''
    },
    progressTime() {
      const date = new Date(0)
      date.setSeconds(this.progress / 1000) // specify value for SECONDS here
      const timeString = date.toISOString().substr(14, 5)

      const date1 = new Date(0)
      const user: any = this.$auth.user
      date1.setSeconds(user.item.duration_ms / 1000) // specify value for SECONDS here
      const timeString1 = date1.toISOString().substr(14, 5)

      return timeString + ' / ' + timeString1
    },
  },
  async mounted() {
    if (this.$auth.loggedIn) {
      const strategy: any = this.$auth.strategy
      this.spotifyApi.setAccessToken(
        strategy.token.get().replace('Bearer ', '')
      )
    }

    // await Notification.requestPermission()
    await this.update()
    setInterval(async () => {
      if (!this.$auth.loggedIn) {
        return
      }
      try {
        await this.$auth.fetchUser()
      } catch (e) {
        this.logout()
      }

      this.update()
    }, 2000)
  },
  methods: {
    getGenre() {
      const user: any = this.$auth.user
      const artistId = user.item.artists[0].id
      this.spotifyApi
        .getArtist(artistId)
        .then((resp) => (this.genres = resp.body.genres))
    },
    async update() {
      if (!this.$auth.loggedIn) {
        return
      }
      const user: any = this.$auth.user
      const syncedPlayer: any = this.$refs.syncedPlayer
      if (this.progress + 3000 < user.progress_ms && this.progress !== 0) {
        await syncedPlayer.seeked(user.progress_ms)
      }
      if (this.progress - 3000 > user.progress_ms && this.progress !== 0) {
        await syncedPlayer.seeked(user.progress_ms)
      }
      this.progress = user.progress_ms
      if (user.is_playing) {
        await this.getGenre()
        clearInterval(this.updater)
        this.updater = setInterval(() => {
          if (this.progress >= user.item.duration_ms) {
            clearInterval(this.updater)
            this.update()
            return
          }
          this.progress += 100
        }, 100)
      }
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
<style lang="css" scoped>
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
</style>
