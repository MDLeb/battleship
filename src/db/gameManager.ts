import { Room, User } from "./dbTypes";

class GameManager {
    private Users: User[] = [];
    private Rooms: Room[] = [];
    // private Winners: User[] = [];

    private connections = new Map<number, User | {}>();

    public getId = () => {
        let id = Math.floor(Math.random() * 1000000);
        if (this.connections.get(id)) {
            this.getId()
        } else {
            this.connections.set(id, {});
            return id;
        }
    };
    // public isUserExists(id){

    // }

    public addUser(userName: string, password: string, id: number): User {
        const newUser = {
            name: userName,
            password: password,
            index: this.Users.length as number,
            room: -1,
            wins: 0
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
            isAvailable: true
        };
        user.room = room.indexRoom;
        this.Rooms.push(room);

        console.log('create', room);
        return room.indexRoom;
    }
    public addUserToRoom(indexRoom: number, connectionId: number): GameManager {
        if (!this.Rooms[indexRoom]) { return this; }

        const user = this.connections.get(connectionId);
        const room: Room = this.Rooms[indexRoom];

        if (room.user1 === user) return this;
        room.user2 = user as User;

        room.isAvailable = room.user1 !== null && room.user2 !== null;

        return this;
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
    public createGame(): GameManager {
        return this;
    }
}

export default new GameManager();
