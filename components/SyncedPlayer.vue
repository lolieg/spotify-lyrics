<template>
  <div v-if="room !== null" class="container">
    <div class="columns is-mobile is-centered">
      <div class="column">
        <b-field label="Invite Code" class="is-pulled-right">
          <b-input id="roomCode" readonly :value="socket.id"></b-input>
          <b-button icon-left="clipboard" @click="copyInviteCode()"></b-button>
        </b-field>
      </div>
      <div class="column is-centered">
        <b-field label="Join Code">
          <b-input v-model="inviteCode"></b-input>
          <b-button icon-left="check" @click="joinRoom()"></b-button>
        </b-field>
      </div>
    </div>
    <div class="content has-text-centered">
      <!-- <h2>Members:</h2> -->
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import SpotifyWebApi from 'spotify-web-api-node'
// eslint-disable-next-line import/named
import { NuxtSocket } from 'nuxt-socket-io'

export default Vue.extend({
  props: {
    spotifyApi: {
      type: SpotifyWebApi,
      required: true,
    },
    socket: {
      type: Object as PropType<NuxtSocket>,
      required: true,
    },
    songId: {
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
      room: null,
      inviteCode: '',
    }
  },
  watch: {
    async songId() {
      await this.updatePlaybackData(true)
      console.log('updated playback')
    },
  },
  async mounted() {
    this.socket.on('receiveRoom', (data) => {
      console.log('room received')
      this.room = data.room
    })
    this.socket.on('update', async (data) => {
      this.$emit('update')
      console.log('updating')
      const room: any = this.room
      if (data.songId === room.songId) {
        console.log('seeking')
        return await this.spotifyApi.seek(data.time)
      }
      console.log('playing')
      await this.spotifyApi.play({
        uris: [data.songId],
        position_ms: data.time + 500, // working against delay here
      })
    })
    this.socket.on('updatePlaybackData', async (data) => {
      await this.updatePlaybackData()
    })
    await this.updateRoom()
  },
  methods: {
    async seeked(time: number) {
      const room: any = this.room
      if (this.socket.id === room.leader) {
        await this.updatePlaybackData(false, time)
      }
    },
    async updateRoom() {
      await new Promise((resolve) =>
        this.socket.emit('getRoom', (resp: any) => resolve(resp))
      )
    },
    async updatePlaybackData(songSkipped = false, time: null | number = null) {
      // const room: any = this.room
      let progress = this.progress
      if (time !== null) {
        progress = time
      }
      if (songSkipped) {
        progress = 0
      }
      await this.socket.emit('updatePlaybackData', {
        songId: this.songId,
        time: progress,
      })
    },
    copyInviteCode() {
      const el: any = this.$el.querySelector('#roomCode')
      el.select()
      document.execCommand('copy')
      this.$buefy.toast.open({
        message: 'Copied to Clipboard',
        position: 'is-top',
        type: 'is-success',
        queue: false,
      })
    },
    async joinRoom() {
      if (!this.verifyCode()) {
        return
      }
      await this.socket.emit('joinRoom', { code: this.inviteCode })
      await this.updateRoom()
    },
    verifyCode() {
      if (this.inviteCode === undefined || this.isEmpty(this.inviteCode)) {
        this.$buefy.toast.open({
          message: 'No Code Provided',
          position: 'is-top',
          type: 'is-danger',
          queue: false,
        })
        return false
      }
      if (this.inviteCode === this.room) {
        this.$buefy.toast.open({
          message: "That's your own code dummy",
          position: 'is-top',
          type: 'is-danger',
          queue: false,
        })
        return false
      }
      return true
    },
    isEmpty(string: string) {
      return string.length === 0 || !string.trim() || string.length < 2
    },
  },
})
</script>
<style></style>
