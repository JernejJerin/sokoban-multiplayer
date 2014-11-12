var User = require('./user');
var GameServer = require('./gameServer');
var uuid = require('node-uuid');

// a hash array that will hold games
// in progress for each room. Key is the id of the room.
var gameRooms = {};

/**
 * A main class for game room.
 *
 * @param roomName
 * @param levelId
 * @param description
 * @param userId
 * @param socketId
 * @constructor
 */
var GameRoom = function(roomName, levelId, description, userId, socketId) {
    // id of the room, generated from a standard UUID v1
    // for generating identifiers
    this.roomId = uuid.v1();

    // name of the room
    this.roomName = roomName;

    // create a game for specified level
    this.gameServer = Object.create(GameServer.prototype);
    GameServer.call(this.gameServer, levelId);

    // description of the room
    this.description = description;

    // all users that are currently connected to this room
    this.users = {};

    // id of the creator
    this.owner = this.joinGameRoom(userId, socketId);

    // add game room to current game rooms
    gameRooms[this.roomId] = this;
};

/**
 * Create a new player, save it and return it
 */
GameRoom.prototype.joinGameRoom = function(userId, socketId) {
    // pop the first available player. If the player is not
    // available, then it will get undefined, which is fine
    var freePlayerId = this.gameServer.freePlayers.pop();
    var player = this.gameServer.players[freePlayerId];
    var user = Object.create(User.prototype);
    User.call(user, userId, socketId, player);
    this.users[socketId] = user;
    return user;
};

/**
 * Create game server state object for client. We do not want to send
 * full game server state to the user.
 */
GameRoom.prototype.gameServerState = function(user) {
    // we do not want to sent to the user the socket id
    // of other users, so we will create object, that will
    // contain userId as a key and player id as a value
    var users = {};
    // TODO: Use Object.keys!
    for (var user in this.users) {
        users[this.users[user].id] = this.users[user].player.id;
    }
    return {
        roomId: this.roomId,
        player: this.users[user].player,
        users: users,
        stones: this.gameServer.stones,
        blocks: this.gameServer.blocks,
        placeholders: this.gameServer.placeholders,
        players: this.gameServer.players
    };
};

/**
 * Get the game room from the current games on the server.
 *
 * @param roomId
 */
var getGameRoom = function(roomId) {
    return gameRooms[roomId];
};

var deleteGameRoom = function(roomId) {
    delete gameRooms[roomId];
};

// export the game rooms currently underway on server
module.exports = {
    gameRooms: gameRooms,
    GameRoom: GameRoom,
    getGameRoom: getGameRoom,
    deleteGameRoom: deleteGameRoom
};