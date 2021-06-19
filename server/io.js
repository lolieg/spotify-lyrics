import Room from './room'
const rooms = []
function findRoom(param, rooms, by = 'code') {
  for (const room of rooms) {
    if (room.code === param) {
      return room
    }
  }
}
export default function (socket, io) {
  const room = new Room(socket.id, [socket.id], socket.id)
  rooms.push(room)
  // setInterval(() => {
  //   for (const room of rooms) {
  //     console.log(room.leader + ' : ' + room.time)
  //   }
  // }, 10000)
  return Object.freeze({
    joinRoom(msg) {
      const roomToJoin = findRoom(msg.code, rooms)
      if (roomToJoin) {
        roomToJoin.members.push(socket.id)
        io.to(roomToJoin.leader).emit('updatePlaybackData')
      }
    },
    updatePlaybackData(msg) {
      room.songId = msg.songId
      room.time = msg.time
      for (const member of room.members) {
        if (member !== socket.id) {
          io.to(member).emit('update', room)
        }
      }
    },
    getRoom(msg) {
      let roomToSend = room
      for (const room1 of rooms) {
        room1.members.forEach((member) => {
          if (member === socket.id) {
            roomToSend = room1
          }
        })
      }
      socket.emit('receiveRoom', { room: roomToSend })
    },
    disconnect() {
      for (const room of rooms) {
        if (socket.id === room.leader) {
          rooms.splice(rooms.indexOf(room), 1)
          break
        }
        room.members.forEach((member) => {
          if (member === socket.id) {
            return room.members.splice(room.members.indexOf(member), 1)
          }
        })
      }
    },
  })
}
