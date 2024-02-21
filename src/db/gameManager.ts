import { Game, Room, ShipData, Ships, User } from "./dbTypes";

let gameId = 0;

class GameManager {
    private Users: User[] = [];
    private Rooms: Room[] = [];

    private connections = new Map<number, User | any>();

    private getConnectionIdForUser(user: User): number | null {
        for (let [key, value] of this.connections) {
            if (value === user) return key;
        }
        return null;
    }

    public getId = () => {
        let id = Math.floor(Math.random() * 1000000);
        if (this.connections.get(id)) {
            this.getId()
        } else {
            this.connections.set(id, {});
            return id;
        }
    };

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
    public updateWinners(): User[] {

        return this.Users;
    }
    public createRoom(connectionId: number): number {
        const user = this.connections.get(connectionId) as User;
        if (user.room > -1) {
            return -1;
        }
        const room: Room = {
            indexRoom: this.Rooms.length as number,
            user1: user as User,
            user2: null,
            isAvailable: true,
            game: null
        };
        user.room = room.indexRoom;
        this.Rooms.push(room);

        console.log('create', room);
        return room.indexRoom;
    }
    public addUserToRoom(indexRoom: number, connectionId: number): Room | null {
        if (!this.Rooms[indexRoom]) { return null; }

        const user = this.connections.get(connectionId);
        const room: Room = this.Rooms[indexRoom];

        if (room.user1 === user) return room;
        room.user2 = user as User;

        user.room = indexRoom;

        room.isAvailable = room.user1 === null || room.user2 === null;

        return room;
    }
    public getUsersInRoom(indexRoom: number): any[] {
        if (!this.Rooms[indexRoom]) { return [] };
        const room: Room = this.Rooms[indexRoom];
        return [room.user1?.index, room.user2?.index];
    }
    public getUserByIndex(index: number): User | null {
        return this.Users[index] ?? null;
    }
    public getAvailableRooms(): Room[] {
        return this.Rooms.filter(i => i.isAvailable);
    }
    public createGame(connectionId: number): Game {
        const user = this.connections.get(connectionId);
        const room = this.Rooms[user.room];

        room.game = {
            id: gameId++,
            user1Field: null,
            user2Field: null,
            turn: room.user1 as User
        };
        return room.game;
    }
    public addShips(data: any, connectionId: number): number[] {
        const user = this.connections.get(connectionId);
        const readyUsers: number[] = [];

        if (!user) return readyUsers;
        const room = this.Rooms[user.room];
        const game = room.game;
        const gameField = new Field(data.ships);


        if (user === room.user1) {
            game && (game.user1Field = gameField);
            if (game && game.user2Field) {
                const connectionId2 = this.getConnectionIdForUser(room.user2 as User);

                readyUsers.push(connectionId, connectionId2 as number);
            }
        }
        if (user === room.user2) {
            game && (game.user2Field = gameField);
            if (game && game.user1Field) {
                const connectionId2 = this.getConnectionIdForUser(room.user1 as User);

                readyUsers.push(connectionId, connectionId2 as number);
            }
        }
        return readyUsers;
    }
    public getUsersShips(connectionId: number): ShipData | null {
        const user = this.connections.get(connectionId);
        const room = this.Rooms[user.room];
        let ships: ShipData | null = null;

        if (room.user1 === user) {
            ships = room.game?.user1Field?.getInitialData() ?? null;
        }
        if (room.user2 === user) {
            ships = room.game?.user2Field?.getInitialData() ?? null;
        }

        return ships;

    }
}

export default new GameManager();

export class Field {

    private ships: number[][] = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    private initialData: ShipData;

    constructor(ships: ShipData) {
        this.initialData = ships;
        ships.forEach(s => {
            for (let i = 0; i < s.length; i++) {
                //ПЕРВЫМ ИДЕТ X , но это столбец, поэтому он как бы Y
                this.ships[s.position.y + (s.direction ? i : 0)][s.position.x + (!s.direction ? i : 0)] = Ships[s.type];
            }
        });
    }

    public getInitialData(): ShipData {
        return this.initialData
    }
    public checkAttack(position: { x: number, y: number }) {
        console.log(this.ships[position.y][position.x]);

        return this.ships[position.y][position.x]
    }
}
