export default class {
  code: string
  members: string[]
  leader: string
  songId: string
  time: number
  constructor(
    code: string,
    members: string[],
    leader: string,
    songId: string = '',
    time: number = 0
  ) {
    this.code = code
    this.members = members
    this.leader = leader
    this.songId = songId
    this.time = time
  }
}
