import GameManager from "../db/gameManager";
import { CommandTypes, Message } from "./wsTypes";
import eventEmitter, { GAME } from './events';
import { Attacks } from "../db/dbTypes";

export const cmdHandler = (message: Message, connectionId: number): any => {
    const cmd = message.type;
    const data = message.data === '' ? '' : JSON.parse(message.data);
    const response: {
        type: any,
        data?: any,
        id: number
    } = {
        type: cmd,
        id: 0
    };
    const responses: any[] = [];

    switch (message.type) {
        case CommandTypes.Registration: {
            const user = GameManager.addUser(data.name, data.password, connectionId);
            response.data = {
                name: user.name,
                index: user.index,
                error: false,
                errorText: ''
            }
            return dataToJSON(response)
        }
        case CommandTypes.UpdateRoom: {
            const rooms = GameManager.getAvailableRooms();
            const res: any[] = [];
            const roomUsers = [];

            rooms.forEach(r => {
                res.push({
                    roomId: r.roomID,
                    roomUsers: [{
                        name: GameManager.getUserName(r.user1ID),
                        index: r.user1ID,
                    }, r.user2ID ? {
                        name: GameManager.getUserName(r.user2ID),
                        index: r.user2ID,
                    } : '']
                });
            });

            response.data = JSON.stringify(res);
            return JSON.stringify(response);
        }
        case CommandTypes.UpdateWinners: {
            const winners = GameManager.updateWinners();
            const res: any[] = [];

            winners.forEach(w => {
                res.push({
                    name: w.name,
                    wins: w.wins
                });
            });

            response.data = JSON.stringify(res);
            return JSON.stringify(response);
        }
        case CommandTypes.CreateRoom: {
            const roomIndex = GameManager.createRoom(connectionId);
            eventEmitter.emit(GAME.UPDATE_ROOMS)
            break;
        }
        case CommandTypes.AddUserToRoom: {
            const room = GameManager.addUserToRoom(data.indexRoom, connectionId);

            eventEmitter.emit(GAME.UPDATE_ROOMS);

            if (!room?.isAvailable) {
                eventEmitter.emit(GAME.CREATE_GAME, room?.user1ID, room?.user2ID, room?.roomID);
            }
            break;
        }
        case CommandTypes.CreateGame: {
            const gameId = GameManager.createGame(data.roomId as number);

            response.data = JSON.stringify({
                idGame: gameId,
                idPlayer: connectionId
            });
            return JSON.stringify(response);
        }
        case CommandTypes.AddShips: {
            const readyUsers: number[] = GameManager.addShips(data.gameId, connectionId, data.ships);

            if (readyUsers.length === 2) {
                eventEmitter.emit(GAME.START_GAME, ...readyUsers, data.gameId);
            }
            return JSON.stringify(response);
        }
        case CommandTypes.StartGame: {
            const usersShips = GameManager.getUsersShips(connectionId);

            response.data = JSON.stringify({
                ships: usersShips,
                indexPlayer: connectionId
            });

            return JSON.stringify(response);
        }
        case CommandTypes.Turn: {
            const turn = GameManager.getGameTurn(data.gameId);

            response.data = JSON.stringify({
                currentPlayer: turn,
            });

            return JSON.stringify(response);
        }
        case CommandTypes.Attack: {
            const res = GameManager.attack(data.gameId, data.indexPlayer, data.x, data.y);
            const game = GameManager.getGame(data.gameId);
            const usersId = game?.getUsersID() as number[];
            const secondPlayer = data.indexPlayer === usersId[0] ? usersId[1] : usersId[0];

            response.data = JSON.stringify({
                position: { x: data.x, y: data.y },
                currentPlayer: data.indexPlayer,
                status: res[0],
            });

            if (res[0] === Attacks[3]) return;
            eventEmitter.emit(GAME.ATTACK, ...usersId, JSON.stringify(response));
            // eventEmitter.emit(GAME.SWITCH_TURN, res[1], res[2], data.gameId);

            return JSON.stringify(response);
        }
    }
}

const dataToJSON = (data: any): string => {

    for (let key in data) {
        if (typeof data[key] === 'object') {
            data[key] = dataToJSON(data[key]);
        }
    }

    return JSON.stringify(data);
};