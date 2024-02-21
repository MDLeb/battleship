import { WebSocketServer, } from 'ws';
import { cmdHandler } from './cmdHandler';
import { CommandTypes, Message } from './wsTypes';
import { User } from 'db/dbTypes';
import GameManager from "../db/gameManager";
import eventEmitter, { GAME } from './events';


export const newWSConnection = () => {
    const ws = new WebSocketServer({ port: 3000 });

    ws.on('connection', function connection(w) {

        const connectionId = GameManager.getId();
        w.on('error', console.error);

        w.on('message', function (message) {
            try {
                const msg = JSON.parse(message.toString());

                if (msg.type === CommandTypes.Registration) {
                    w.send(cmdHandler(msg as Message, connectionId as number));
                    w.send(cmdHandler({ type: CommandTypes.UpdateRoom, data: '' } as Message, connectionId as number));
                    w.send(cmdHandler({ type: CommandTypes.UpdateWinners, data: '' } as Message, connectionId as number));
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
        eventEmitter.on(GAME.CREATE_GAME, (id1, id2) => {
            if (connectionId === id1 || connectionId === id2) {
                w.send(cmdHandler({ type: CommandTypes.CreateGame, data: '' } as Message, connectionId as number));
            }
        });
        eventEmitter.on(GAME.START_GAME, (id1, id2) => {
            if (connectionId === id1 || connectionId === id2) {
                w.send(cmdHandler({ type: CommandTypes.StartGame, data: '' } as Message, connectionId as number));
            }
        });


        w.send(JSON.stringify({ "type": "ws open" }));
    });
    return ws;
}

