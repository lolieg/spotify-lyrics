export const state = () => ({
  listenTogether: true,
  lyricsAndPlayer: true,
  infoText: true,
  lrcText: null,
  songName: '',
})

export const mutations = {
  toggle(state, obj) {
    state[obj] = !state[obj]
  },
  changeLrc(state, obj) {
    state.lrcText = obj
  },
  setSongName(state, obj) {
    state.songName = obj
  },
}
