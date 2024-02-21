import { EventEmitter } from 'node:events';
export default new EventEmitter();

export enum GAME {
    UPDATE_ROOMS = 'updateRooms',
    UPDATE_WINNERS = 'updateWinners',
    CREATE_GAME = 'createGame',
    START_GAME = 'startGame',
    // UPDATE_WINNERS = 'updateWinners',
    // UPDATE_WINNERS = 'updateWinners',
    // UPDATE_WINNERS = 'updateWinners',
}