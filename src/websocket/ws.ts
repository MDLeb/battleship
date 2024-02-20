import { WebSocketServer, } from 'ws';
import { cmdHandler } from './cmdHandler';
import { CommandTypes, Message } from './wsTypes';
import { User } from 'db/dbTypes';
import GameManager from "../db/gameManager";
import eventEmitter from './events';


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

        eventEmitter.on('updateRooms', () => {
            ws.clients.forEach(function each(client) {
                client.send(cmdHandler({ type: CommandTypes.UpdateRoom, data: '' } as Message, connectionId as number));
            });
        });

        eventEmitter.on('updateWinners', () => {
            ws.clients.forEach(function each(client) {
                client.send(cmdHandler({ type: CommandTypes.UpdateWinners, data: '' } as Message, connectionId as number));
            });
        });

        w.send(JSON.stringify({ "type": "ws open" }));
    });
    return ws;
}

