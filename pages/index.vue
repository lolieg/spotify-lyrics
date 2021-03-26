<template>
  <section>
    <b-button v-if="!$auth.loggedIn" @click="login()">Login</b-button>
    <b-button v-if="$auth.loggedIn" @click="logout()">Logout</b-button>
    <div v-if="$auth.loggedIn">
      <h1>{{ $auth.user.item.name }}</h1>
      <b-progress
        :value="(progress / $auth.user.item.duration_ms) * 100"
      ></b-progress>
      <Lyrics
        :song-name="$auth.user.item.name"
        :artist-name="$auth.user.item.artists[0].name"
        :progress="progress"
      ></Lyrics>
    </div>
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
  async mounted() {
    await this.update()
    setInterval(async () => {
      if (!this.$auth.loggedIn) {
        return
      }
      const old = this.$auth.user.item.name
      await this.$auth.fetchUser()
      if (this.$auth.user.item.name !== old) {
        this.update()
      }
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
