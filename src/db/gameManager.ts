import { Game, Field } from "./Game";
import { Room } from "./Room";

import { Attacks, ShipData, Ships, User } from "./dbTypes";

class GameManager {
    private Users: User[] = [];
    private Rooms = new Map<number, Room>();
    private Games = new Map<number, Game>();

    private connections = new Map<number, User | any>();

    public getId() {
        let id = Math.floor(Math.random() * 1000000);
        if (this.connections.get(id)) {
            this.getId()
        } else {
            this.connections.set(id, {});
            return id;
        }
    };
    public getUserName(connectionId: number): string {
        const user = this.connections.get(connectionId) as User;
        return user.name;
    }
    public addUser(userName: string, password: string, id: number): User {
        const newUser = {
            name: userName,
            password: password,
            index: this.Users.length as number,
            room: -1,
            wins: 0,
            id: id
        }
        this.Users.push(newUser);
        this.connections.set(id, newUser);
        return newUser;
    }
    public getRoom(roomId: number): Room | null {
        return this.Rooms.get(roomId) ?? null;
    }
    public getGame(gameId: number): Game | null {
        return this.Games.get(gameId) ?? null;
    }
    public updateWinners(): User[] {

        return this.Users;
    }
    public createRoom(connectionId: number, single: boolean = false): number {
        const user = this.connections.get(connectionId) as User;
        if (user.room > -1) {
            return -1;
        }
        const room = new Room(connectionId);
        user.room = room.roomID;
        this.Rooms.set(room.roomID, room);

        if(single){
            room.addBot();
        }
        return room.roomID;
    }
    public addUserToRoom(indexRoom: number, connectionId: number): Room | null {
        if (!this.Rooms.get(indexRoom)) { return null; }

        const user = this.connections.get(connectionId);
        if (indexRoom === user.room) { return null; }

        const room = this.Rooms.get(indexRoom);

        if (user.room > 0) {
            this.Rooms.delete(user.room)
            user.room = -1;
        }

        room?.addUser(connectionId);
        user.room = indexRoom;
        return room ?? null;
    }
    public getAvailableRooms(): Room[] {
        const rooms: any = [];
        for (let [key, value] of this.Rooms) {
            if (value.isAvailable) {
                rooms.push(value)
            }
        }
        return rooms;
    }
    public createGame(roomId: number): number {
        const room = this.Rooms.get(roomId) as Room;

        if (room.game) {
            return room.game.id
        } else {
            const gameId = room.createGame();
            if (room.game) this.Games.set(gameId, room.game as Game);
            return gameId;
        };


    }
    public addShips(gameId: number, connectionId: number, ships: ShipData): number[] {
        const game = this.Games.get(gameId) as Game;
        
        const readyUsers = game.addShips(connectionId, ships);
        return readyUsers;
    }
    public getUsersShips(connectionId: number): ShipData | null {
        const user = this.connections.get(connectionId);
        const room = this.Rooms.get(user.room);
        const game = room?.game as Game;
        let ships: ShipData = game.getUsersShips(connectionId) as ShipData;
        return ships;

    }
    public attack(gameId: number, connectionId: number, x: number, y: number): any[] {
        const game = this.Games.get(gameId) as Game;
        const attackRes = game.attack(connectionId, x, y);
        return [...attackRes];
    }
    public getGameTurn(gameId: number): number | null {
        const game = this.Games.get(gameId) as Game;
        return game.getTurn();
    }
    public finishGame(gameId: number) {
        const game = this.Games.get(gameId) as Game;

        if (!game) return 0;

        const players = game.getUsersID();
        const winner = game.getWinner();
        if (!winner) return;
        const user = this.connections.get(winner);

        user.wins += 1;
        const roomId = user.room;

        players.forEach(id => {
            delete this.connections.get(id).game;
            this.connections.get(id).room = -1;
        })

        this.Games.delete(gameId);
        this.Games.delete(roomId);

        return winner;
    }

}

export default new GameManager();
