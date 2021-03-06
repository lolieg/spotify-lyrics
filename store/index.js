export const state = () => ({
  listenTogether: true,
  player: true,
  lyrics: true,
  infoText: true,
  lrcText: null,
  songName: '',
  offset: 0,
  performanceMode: false,
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
  setOffset(state, obj) {
    state.offset = obj
  },
}
