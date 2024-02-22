// import { Field } from "./gameManager";

import { Game } from "./Game";

export type User = {
    name: string,
    password: string,
    index: number,
    id?: number
    room: number;
    game?: Game;
    wins: number
}
// export type Game = {
//     id: number,
//     user1: User | null,
//     user2: User | null,
//     user1Field?: Field | null,
//     user2Field?: Field | null,
//     turn: User
// }
// export type Room = {
//     indexRoom: number,
//     user1: User | null,
//     user2: User | null,
//     isAvailable: boolean,
//     game: Game | null,

// }

// export type GameField = number[][];
export enum Ships {
    "small" = 1,
    "medium" = 2,
    "large" = 3,
    "huge" = 4
}
export enum Attacks {
    "miss",
    "shot",
    "killed",
    "wrongAttack"
}
export type ShipData = { position: { x: number, y: number }, direction: boolean, length: number, type: "small" | "medium" | "large" | "huge" }[]