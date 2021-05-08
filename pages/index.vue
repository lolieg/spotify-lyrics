<template>
  <section id="section">
    <div class="authBtns">
      <b-button v-if="!$auth.loggedIn" @click="login()">Login</b-button>
      <b-button v-if="$auth.loggedIn" @click="logout()">Logout</b-button>
    </div>

    <div v-if="$auth.loggedIn && $auth.user.is_playing">
      <h1 class="has-text-centered" style="font-size: 2vh">
        {{ $auth.user.item.name }} - {{ $auth.user.item.artists[0].name }}
      </h1>
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
</template>

<script>
export default {
  data() {
    return {
      progress: 0,
      updater: null,
    }
  },
  computed: {
    progressTime() {
      const date = new Date(0)
      date.setSeconds(this.progress / 1000) // specify value for SECONDS here
      const timeString = date.toISOString().substr(14, 5)

      const date1 = new Date(0)
      date1.setSeconds(this.$auth.user.item.duration_ms / 1000) // specify value for SECONDS here
      const timeString1 = date1.toISOString().substr(14, 5)

      return timeString + ' / ' + timeString1
    },
  },
  async mounted() {
    await this.update()
    setInterval(async () => {
      if (!this.$auth.loggedIn) {
        return
      }
      // const old = this.$auth.user.item.name
      await this.$auth.fetchUser()

      this.update()
    }, 4000)
  },
  methods: {
    update() {
      if (!this.$auth.loggedIn) {
        return
      }
      this.progress = this.$auth.user.progress_ms
      if (this.$auth.user.is_playing) {
        clearInterval(this.updater)
        this.updater = setInterval(async () => {
          if (this.progress >= this.$auth.user.item.duration_ms) {
            clearInterval(this.updater)
            await this.update()
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
}
</script>
<style lang="css" scoped>
#songProgress {
  margin-left: 10vh;
  margin-right: 10vh;
}
.authBtns {
  margin-top: 2vh;
  margin-bottom: 2vh;
  display: grid;
  place-items: center;
}
</style>