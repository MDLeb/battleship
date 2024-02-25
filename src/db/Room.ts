import { Game } from "./Game";
import { Attacks, ShipData, Ships, User } from "./dbTypes";

interface IRoom {
    roomID: number,
    user1ID: number,
    user2ID: number,
    isAvailable: boolean,
    game: Game | null,
}

export class Room implements IRoom {
    roomID: number;
    user1ID: number;
    user2ID: number;
    isAvailable: boolean = true;
    game: Game | null = null;

    constructor(user1ID: number) {
        this.roomID = Math.floor(Math.random() * 1000);
        this.user1ID = user1ID;
        this.user2ID = 0;

    }

    public addUser(userID: number) {

        if (this.user1ID !== 0 && this.user2ID !== 0) return;
        if (this.user1ID > 0) {
            this.user2ID = userID;
        } else if (this.user2ID > 0) {
            this.user1ID = userID;
        }
        if (this.user1ID > 0 && this.user2ID > 0) {
            this.isAvailable = false;
        };
        return this;
    }
    public addBot() {

        this.user2ID = -1;
        this.isAvailable = false;
        return this;
    }
    public createGame() {
        this.game = new Game(this.user1ID, this.user2ID);
        return this.game.id;
    }


}

