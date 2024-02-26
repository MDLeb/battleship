import { Game } from "./Game";

export type User = {
    name: string,
    password: string,
    index: number,
    id?: number
    room: number;
    game?: Game;
    wins: number;
    isConnected: boolean
}
export type Err = {
    error: boolean,
    errorMessage: string
}
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