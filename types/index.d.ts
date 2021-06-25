/* eslint-disable no-unused-vars */
import SpotifyApi from 'spotify-web-api-node'
import { Auth as NuxtAuth } from '@nuxtjs/auth-next'
import anime from 'animejs'

declare module 'vue/types/vue' {
  interface Auth extends NuxtAuth {
    user: SpotifyApi.CurrentlyPlayingObject & typeof NuxtAuth.prototype.user
  }
  interface Vue {
    $anime: typeof anime
  }
}

declare module '@nuxt/types' {
  interface Auth extends NuxtAuth {
    user: SpotifyApi.CurrentlyPlayingObject & typeof NuxtAuth.prototype.user
  }
}

declare module 'vuex/types/index' {
  interface Auth extends NuxtAuth {
    user: SpotifyApi.CurrentlyPlayingObject & typeof NuxtAuth.prototype.user
  }
}
