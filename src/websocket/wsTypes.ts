import { subscribe } from "diagnostics_channel"

export enum CommandTypes {
    Registration = 'reg',
    UpdateWinners = 'update_winners',
    CreateRoom = 'create_room',
    AddUserToRoom = 'add_user_to_room',
    CreateGame = 'create_game',
    UpdateRoom = 'update_room',
    
    AddShips = 'add_ships',
    StartGame = 'start_game',
    Attack = 'attack',
    UpdateKilled = 'update_killed',
    RandomAttack = 'randomAttack',
    Turn = 'turn',
    Finish = 'finish',
    SinglePlay = 'single_play',
    Disconnection = 'disconnection'
}

export type Message = {
    type: CommandTypes,
    data: string,
    id?: number
}

// export type answerTypes = {
//    'reg': {data: {name: string, password: string}, subscribers: 'one'},
//    'update_winners': {data: {name: string, index: number, error: boolean, errorText: string}}
// }
// {name: string, index: number, error: boolean, errorText: string},
// {name: string, wins: number}[].
// "",
// {roomId: number, roomUsers: {name: string, index: number}[]} |
// {gameId: number, ships: {position: {x: number, y: number}, direction: boolean, length: number, type:  "small"|"medium"|"large"|"huge"}[], indexPlayer: number},
// {ships: {position: {x: number, y: number}, direction: boolean, length: number, type:  "small"|"medium"|"large"|"huge"}[], currentPlayerIndex: number},
// {gameId: number, x: number, y: number, indexPlayer: number},
// {position: {x: number, y: number}, currentPlayer: number, status: "miss"|"killed"|"shot"},
// {gameId: number, indexPlayer: number},
// {currentPlayer: number},
// {winPlayer: number},
