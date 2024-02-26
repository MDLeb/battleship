import { WebSocketServer, } from 'ws';
import { cmdHandler } from './cmdHandler';
import { CommandTypes, Message } from './wsTypes';
import { User } from 'db/dbTypes';
import GameManager from "../db/gameManager";
import eventEmitter, { GAME } from './events';


export const newWSConnection = () => {
    const ws = new WebSocketServer({ port: 3000, host: 'localhost' });

    ws.on('connection', function connection(w) {

        const connectionId = GameManager.getId();
        w.on('error', console.error);

        w.on('close', () => {
            GameManager.disconnectUser(connectionId as number);
        });

        w.on('message', function (message) {
            try {
                const msg = JSON.parse(message.toString());

                if (msg.type === CommandTypes.Registration) {
                    w.send(cmdHandler(msg as Message, connectionId as number));
                    w.send(cmdHandler({ type: CommandTypes.UpdateRoom, data: '' } as Message, connectionId as number));
                    eventEmitter.emit(GAME.UPDATE_WINNERS);
                } else {
                    cmdHandler(msg as Message, connectionId as number)
                }
            }
            catch (error) {
                console.log(error);
            }
        });

        eventEmitter.on(GAME.UPDATE_ROOMS, () => {
            w.send(cmdHandler({ type: CommandTypes.UpdateRoom, data: '' } as Message, connectionId as number));
        });

        eventEmitter.on(GAME.UPDATE_WINNERS, () => {
            w.send(cmdHandler({ type: CommandTypes.UpdateWinners, data: '' } as Message, connectionId as number));
        });
        eventEmitter.on(GAME.CREATE_GAME, (id1, id2, roomId) => {
            if (connectionId === id1 || connectionId === id2) {
                w.send(cmdHandler({ type: CommandTypes.CreateGame, data: JSON.stringify({ "roomId": roomId }) as any } as Message, connectionId as number));
            }
        });
        eventEmitter.on(GAME.START_GAME, (id1, id2, gameId) => {
            if (connectionId === id1 || connectionId === id2) {
                w.send(cmdHandler({ type: CommandTypes.StartGame, data: '' } as Message, connectionId as number));
                w.send(cmdHandler({ type: CommandTypes.Turn, data: JSON.stringify({ "gameId": gameId }) as any } as Message, connectionId as number));
            }
        });
        eventEmitter.on(GAME.SWITCH_TURN, (id1, id2, gameId) => {
            if (connectionId === id1 || connectionId === id2) {
                w.send(cmdHandler({ type: CommandTypes.Turn, data: JSON.stringify({ "gameId": gameId }) as any } as Message, connectionId as number));
            }
        });
        eventEmitter.on(GAME.ATTACK, (id1, id2, responseString) => {
            if (connectionId === id1 || connectionId === id2) {
                w.send(responseString);
            }
        });
    
        eventEmitter.on(GAME.UPDATE_KILLED, (id1, id2, responseString) => {
            if (connectionId === id1 || connectionId === id2) {
                w.send(responseString);
            }
        });
        eventEmitter.on(GAME.FINISH, (id1, id2, responseString) => {
            if (connectionId === id1 || connectionId === id2) {
                w.send(responseString);
            }
        });
        w.send(JSON.stringify({ "type": "ws open" }));
    });
    return ws;
}

