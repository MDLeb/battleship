import { Attacks, Game, Room, ShipData, Ships, User } from "./dbTypes";

// let gameId = 0;

class GameManager {
    private Users: User[] = [];
    private Rooms: Room[] = [];
    private Games: Game[] = [];

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
    // public getUsersInRoom(indexRoom: number): any[] {
    //     if (!this.Rooms[indexRoom]) { return [] };
    //     const room: Room = this.Rooms[indexRoom];
    //     return [room.user1?.index, room.user2?.index];
    // }
    // public getUsersInRoom(indexRoom: number): any[] {
    //     if (!this.Rooms[indexRoom]) { return [] };
    //     const room: Room = this.Rooms[indexRoom];
    //     const id1 = this.getConnectionIdForUser(room.user1 as User);
    //     const id2 = this.getConnectionIdForUser(room.user2 as User);

    //     return [id1, id2];
    // }
    public getGameTurn(connectionId1: number, connectionId2: number): number | null {
        const user1 = this.connections.get(connectionId1);
        const user2 = this.connections.get(connectionId2);
        const game = this.Rooms[user1.room].game;
        const turn = game?.turn;
        if (user1 === turn) return connectionId1;
        if (user2 === turn) return connectionId2;
        return null;
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
            id: this.Games.length,
            user1: room.user1,
            user2: room.user1,
            user1Field: null,
            user2Field: null,
            turn: room.user1 as User
        };
        this.Games.push(room.game)
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
    public attack(gameId: number, connectionId: number, x: number, y: number): any[] {
        const game = this.Games[gameId];
        const userActive = game.turn;
        if (userActive !== this.connections.get(connectionId)) {
            console.log('YOUR FUCKING LOGIC IS WRONG');

        }
        const fieldUnderAttack: Field = userActive === game.user1 ? game.user2Field as Field : game.user1Field as Field;
        const attackResult: Attacks = fieldUnderAttack.checkAttack(x, y);

        if(attackResult !== Attacks.killed && attackResult !== Attacks.shot){
            game.turn = game.turn === game.user1 ? game.user2 as User : game.user1 as User;
        }

        return [attackResult, this.getConnectionIdForUser(game.user1 as User), this.getConnectionIdForUser(game.user2 as User)];
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

    private checkNearCeils(l: number, x: number, y: number) {
        for (let i = x, j = x; i < x + l - 1 && j > x - l + 1; j--) {
            if ((this.ships[y][i] && this.ships[y][i] === l) || (this.ships[y][j] && this.ships[y][j] === l)) return true;
        }
        for (let i = y, j = y; i < y + l - 1 && j > y - l + 1; j--) {
            if ((this.ships[i][x] && this.ships[i][x] === l) || (this.ships[j][x] && this.ships[j][x] === l)) return true;
        }
        return false;
    }
    public getInitialData(): ShipData {
        return this.initialData
    }
    public checkAttack(x: number, y: number): Attacks {
        const ceil = this.ships[y][x];
        if (ceil === 0) return Attacks.miss;
        if (ceil > 0 && ceil < 5 && this.checkNearCeils(ceil, x, y)) return Attacks.shot;
        if (ceil > 0 && ceil < 5 && !this.checkNearCeils(ceil, x, y)) return Attacks.killed;

        return this.ships[y][x]
    }
}
