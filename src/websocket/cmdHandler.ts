import GameManager from "../db/gameManager";
import { CommandTypes, Message } from "./wsTypes";
import eventEmitter, { GAME } from './events';

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
    console.log(message.type);

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

            rooms.forEach(r => {
                res.push({
                    roomId: r.indexRoom,
                    roomUsers: [{
                        name: r.user1?.name,
                        index: r.user1?.index,
                    }, {
                        name: r.user2?.name,
                        index: r.user2?.index,
                    }]
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
                eventEmitter.emit(GAME.CREATE_GAME, room?.user1?.id, room?.user2?.id);
            }
            break;
        }
        case CommandTypes.CreateGame: {
            const game = GameManager.createGame(connectionId as number);

            response.data = JSON.stringify({
                idGame: game.id,
                idPlayer: connectionId
            });
            return JSON.stringify(response);

            break;
        }
        case CommandTypes.AddShips: {
            const readyUsers: number[] = GameManager.addShips(data, connectionId);
            console.log(readyUsers);

            if (readyUsers.length === 2) {
                eventEmitter.emit(GAME.START_GAME, ...readyUsers);
            }
            return JSON.stringify(response);
        }
        case CommandTypes.StartGame: {
            const usersShips = GameManager.getUsersShips(connectionId);
            console.log(usersShips);

            response.data = JSON.stringify({
                ships: usersShips,
                indexPlayer: connectionId
            });

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