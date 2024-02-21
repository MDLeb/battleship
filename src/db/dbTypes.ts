import { Field } from "./gameManager";

export type User = {
    name: string,
    password: string,
    index: number,
    id?: number
    room: number;
    wins: number
}
export type Game = {
    id: number,
    user1Field?: Field | null,
    user2Field?: Field | null,
    turn: User
}
export type Room = {
    indexRoom: number,
    user1: User | null,
    user2: User | null,
    isAvailable: boolean,
    game: Game | null,

}

// export type GameField = number[][];
export enum Ships {
    "small" = 1,
    "medium" = 2,
    "large" = 3,
    "huge" = 4
}

export type ShipData = { position: { x: number, y: number }, direction: boolean, length: number, type: "small" | "medium" | "large" | "huge" }[]