export type User = {
    name: string,
    password: string,
    index: number,
    // id: number
    room: number;
    wins: number
}
export type Room = {
    indexRoom: number,
    user1: User | null,
    user2: User | null,
    isAvailable: boolean
}
export type GameField = {

}