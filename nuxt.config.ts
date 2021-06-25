// @ts-ignore
const dev = process.env.NODE_ENV !== 'production'
export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: true,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Spotify Lyrics',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'Log in with your spotify account and get the Lyrics for your current song displayed.',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  serverMiddleware: [{ path: '/api', handler: '~/api/index.ts' }],
  server: {
    // host: '192.168.0.15',
    port: 3002,
  },
  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/buefy
    'nuxt-buefy',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/pwa',
    'nuxt-socket-io',
    'nuxt-animejs',
  ],

  io: {
    sockets: [
      {
        url: dev ? 'http://localhost:3002' : 'https://lyrics.marvinweber.me',
        default: true,
      },
    ],
  },

  pwa: {
    manifest: {
      lang: 'en',
      name: 'Spotify Lyrics',
      short_name: 'Synced Lyrics',
      display: 'standalone',
    },
    workbox: {
      // dev, // or use a global variable to track the current NODE_ENV, etc to determine dev mode
    },
  },

  auth: {
    strategies: {
      spotify: {
        scheme: 'oauth2',
        endpoints: {
          authorization: 'https://accounts.spotify.com/authorize',
          token: 'https://accounts.spotify.com/api/token',
          userInfo: 'https://api.spotify.com/v1/me/player',
        },
        token: {
          property: 'access_token',
          type: 'Bearer',
          maxAge: 3060,
        },
        refreshToken: {
          property: 'refresh_token',
          maxAge: 60 * 60 * 24 * 30,
        },
        responseType: 'code',
        grantType: 'authorization_code',
        accessType: undefined,
        redirectUri: undefined,
        logoutRedirectUri: undefined,
        clientId: '7fa85f0c1dab4285a261292975b2219f',
        scope: ['user-read-playback-state', 'user-modify-playback-state'],
        state: 'UNIQUE_AND_NON_GUESSABLE',
        codeChallengeMethod: 'S256',
        responseMode: '',
        acrValues: '',
        // autoLogout: true,
      },
    },
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: dev ? 'http://localhost:3002' : 'https://lyrics.marvinweber.me',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}
