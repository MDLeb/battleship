import { EventEmitter } from 'node:events';
export default new EventEmitter();

export enum GAME {
    UPDATE_ROOMS = 'updateRooms',
    UPDATE_WINNERS = 'updateWinners',
    CREATE_GAME = 'createGame',
    START_GAME = 'startGame',
    SWITCH_TURN = 'switchTurn',
    ATTACK = 'attack',
    UPDATE_KILLED = 'updateKilled',
}