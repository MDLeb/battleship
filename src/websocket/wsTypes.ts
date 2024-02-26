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
