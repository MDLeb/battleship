import GameManager from "../db/gameManager";
import { CommandTypes, Message } from "./wsTypes";
import eventEmitter, { GAME } from './events';
import { Attacks } from "../db/dbTypes";
import { Game } from "db/Game";

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
    console.log(message);


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
            GameManager.createRoom(connectionId);
            eventEmitter.emit(GAME.UPDATE_ROOMS)
            break;
        }
        case CommandTypes.AddUserToRoom: {
            const room = GameManager.addUserToRoom(data.indexRoom, connectionId);
            if (connectionId === room?.user1ID) return;

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

            //BOT
            if (turn === -1) {
                
            }

            response.data = JSON.stringify({
                currentPlayer: turn,
            });

            return JSON.stringify(response);
        }
        case CommandTypes.Attack: {
            const game = GameManager.getGame(data.gameId);

            if (game?.turn !== data.indexPlayer) return;
            if (game?.isGameFinished()) return;

            const res = GameManager.attack(data.gameId, data.indexPlayer, data.x, data.y);
            const usersId = game?.getUsersID() as number[];

            response.data = JSON.stringify({
                position: { x: data.x, y: data.y },
                currentPlayer: data.indexPlayer,
                status: res[0],
            });

            if (res[0] === Attacks[3]) return;

            eventEmitter.emit(GAME.ATTACK, ...usersId, JSON.stringify(response));

            if (res[0] === Attacks[0]) {
                game?.switchTurn();
                eventEmitter.emit(GAME.SWITCH_TURN, ...usersId, data.gameId);
                return;
            };
            if (res[1]) {
                res[1].forEach((pos: any) => {

                    response.data = JSON.stringify({
                        position: { x: pos.y, y: pos.x },
                        currentPlayer: data.indexPlayer,
                        status: pos.status,
                    });
                    eventEmitter.emit(GAME.UPDATE_KILLED, ...usersId, JSON.stringify(response));
                })
            }
        }
        case CommandTypes.RandomAttack: {
            const game = GameManager.getGame(data.gameId);

            if (game?.turn !== data.indexPlayer) return;
            if (game?.isGameFinished()) return;

            let attack = Attacks[3];
            let res: any[] = [];
            let randomX: number = 0, randomY: number = 0;

            while (attack === Attacks[3]) {
                randomX = Math.floor(Math.random() * 10);
                randomY = Math.floor(Math.random() * 10);

                res = GameManager.attack(data.gameId, data.indexPlayer, randomX, randomY);
                attack = res[0];
            }
            const usersId = game?.getUsersID() as number[];

            if (res[0] === Attacks[3]) return;

            response.type = CommandTypes.Attack;
            response.data = JSON.stringify({
                position: { x: randomX, y: randomY },
                currentPlayer: data.indexPlayer,
                status: res[0],
            });

            eventEmitter.emit(GAME.ATTACK, ...usersId, JSON.stringify(response));

            if (res[0] === Attacks[0]) {
                game?.switchTurn();
                eventEmitter.emit(GAME.SWITCH_TURN, ...usersId, data.gameId);
                return;
            };

            if (res[1]) {
                res[1].forEach((pos: any) => {
                    response.data = JSON.stringify({
                        position: { x: pos.y, y: pos.x },
                        currentPlayer: data.indexPlayer,
                        status: pos.status,
                    });
                    eventEmitter.emit(GAME.UPDATE_KILLED, ...usersId, JSON.stringify(response));

                })
            }
            if (res[0] === Attacks[1] || res[0] === Attacks[2]) {
                cmdHandler(message, connectionId);
            };
        }
        case CommandTypes.Finish: {
            const game = GameManager.getGame(data.gameId) as Game;
            if (!game) return;
            console.log(game.isGameFinished());

            if (!game.isGameFinished()) return;

            const usersId = game?.getUsersID() as number[];
            const winner = GameManager.finishGame(data.gameId)
            response.data = JSON.stringify({
                winPlayer: winner,
            });

            response.type = GAME.FINISH;
            console.log(JSON.stringify(response));

            eventEmitter.emit(GAME.UPDATE_WINNERS);
            eventEmitter.emit(GAME.FINISH, ...usersId, JSON.stringify(response));
        }
        case CommandTypes.SinglePlay: {
            const roomId = GameManager.createRoom(connectionId, true);
            eventEmitter.emit(GAME.CREATE_GAME, connectionId, -1, roomId);
            break;
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