import GameManager from "../db/gameManager";
import { Registration } from "./cmds";
import { CommandTypes, Message } from "./wsTypes";
import eventEmitter from './events';

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
            eventEmitter.emit('updateRooms')
            break;
        }
        case CommandTypes.AddUserToRoom: {
            GameManager.addUserToRoom(data.indexRoom, connectionId);
            const userIndeces = GameManager.getUsersInRoom(data.indexRoom);
            eventEmitter.emit('updateRooms')
            break;
        }
        // case CommandTypes.StartGame: {
        //     let {user1, user2} = data;
        //     user1 = GameManager.getUserByIndex(user1);
        //     user2 = GameManager.getUserByIndex(user2);

        //     response.data = {
        //         name: user.name,
        //         index: user.index,
        //         error: false,
        //         errorText: ''
        //     }
        //     // sender();
        //     ws.send(dataToJSON(response))


        //     break;
        // }
    }


    // return responses;

}

const dataToJSON = (data: any): string => {

    for (let key in data) {
        if (typeof data[key] === 'object') {
            data[key] = dataToJSON(data[key]);
        }
    }

    return JSON.stringify(data);
};