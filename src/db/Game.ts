import { RandomField } from "./RandomField";
import { Attacks, ShipData, Ships, User } from "./dbTypes";

interface IGame {
    id: number,
    user1ID: number,
    user2ID: number,
    user1Field?: Field | null,
    user2Field?: Field | null,
    turn: number
}

export class Game implements IGame {
    id: number;
    user1ID: number;
    user2ID: number;
    user1Field?: Field | null;
    user2Field?: Field | null;
    turn: number;

    constructor(user1ID: number, user2ID: number) {
        this.id = Math.floor(Math.random() * 1000);
        this.user1ID = user1ID;
        this.user2ID = user2ID;
        this.turn = user2ID;

        //BOT FIELD
        if (user2ID === -1) {

            const botFieldData = new RandomField().getShipsData();
            this.user2Field = new Field(botFieldData);
        }
    }

    public switchTurn() {
        if (this.turn === this.user2ID) {
            this.turn = this.user1ID
        } else {
            this.turn = this.user2ID
        };
    }
    public addShips(connectionId: number, ships: ShipData) {
        if (connectionId === this.user1ID) {
            this.user1Field = new Field(ships)
        }
        if (connectionId === this.user2ID) {
            this.user2Field = new Field(ships)
        }
        const readyUsers = [];
        if (this.user1Field) { readyUsers.push(this.user1ID) };
        if (this.user2Field) { readyUsers.push(this.user2ID) };

        return readyUsers;
    }
    public getUsersShips(connectionId: number): ShipData | null {
        if (connectionId === this.user1ID && this.user1Field) {
            return this.user1Field?.getInitialData() as ShipData;
        }
        if (connectionId === this.user2ID && this.user2Field) {
            return this.user2Field?.getInitialData() as ShipData;
        }
        return null;
    }
    public getTurn(): number {
        return this.turn;
    }
    public attack(connectionId: number, x: number, y: number): any[] {
        if (connectionId === this.user1ID && this.user2Field) {
            const checkRes = this.user2Field?.checkAttack(x, y);
            const toUpdate = JSON.parse(JSON.stringify(this.user2Field.needUpdateKilled));
            if (toUpdate) {
                this.user2Field.needUpdateKilled = null
                return [checkRes, toUpdate];
            }
            return [checkRes];
        }
        if (connectionId === this.user2ID && this.user1Field) {
            const checkRes = this.user1Field?.checkAttack(x, y);
            const toUpdate = JSON.parse(JSON.stringify(this.user1Field.needUpdateKilled));
            if (toUpdate) {
                this.user1Field.needUpdateKilled = null
                return [checkRes, toUpdate];
            }
            return [checkRes]
        }
        return []
    }
    public getUsersID() {
        return [this.user1ID, this.user2ID];
    }
    public isGameFinished(): boolean {
        return !((this.user1Field?.isAlive() ?? false) && (this.user2Field?.isAlive() ?? false))
    }
    public getWinner(): number {

        console.log();
        
        if (!this.user1Field?.isAlive()) return this.user2ID;
        if (!this.user2Field?.isAlive()) return this.user1ID;
        return 0;
    }
}

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
    public needUpdateKilled: any[] | null = null;

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
        for (let i = x, j = x; i < x + l - 1 && j > x - l + 1; i++, j--) {
            if ((this.ships[y][i] && this.ships[y][i] === l) || (this.ships[y][j] && this.ships[y][j] === l)) return true;
        }
        for (let i = y, j = y; i < y + l - 1 && j > y - l + 1; i++, j--) {
            if ((this.ships[i][x] && this.ships[i][x] === l) || (this.ships[j][x] && this.ships[j][x] === l)) return true;
        }
        return false;
    }
    private checkIsKilled(l: number, x: number, y: number) {
        let isKilled = l - 1;
        const needToUpdate = [];
        for (let i = x, j = x; i < x + l && j >= x - l + 1; i++, j--) {
            if (this.ships[y] && this.ships[y][i] && this.ships[y][i] === (l * -1)) {
                isKilled -= 1;
                needToUpdate.push({ 'x': y, 'y': i, status: Attacks[2] })
            };
            if (this.ships[y] && this.ships[y][j] && this.ships[y][j] === (l * -1)) {
                isKilled -= 1;
                needToUpdate.push({ 'x': y, 'y': j, status: Attacks[2] })
            };
        }
        if (isKilled !== 0) {
            for (let i = y, j = y; i < y + l && j >= y - l + 1; i++, j--) {
                if (this.ships[i] && this.ships[i][x] && this.ships[i][x] === (l * -1)) {
                    isKilled -= 1;
                    needToUpdate.push({ 'x': i, 'y': x, status: Attacks[2] })
                }
                if (this.ships[j] && this.ships[j][x] && this.ships[j][x] === (l * -1)) {
                    isKilled -= 1;
                    needToUpdate.push({ 'x': j, 'y': x, status: Attacks[2] })
                };
            }
        }

        return { value: isKilled === 0, needToUpdate };
    }
    private getEmptyAfterKilled(values: { x: number, y: number }[]): { x: number, y: number, status: keyof typeof Attacks }[] {
        const resToUpdate: { x: number, y: number, status: keyof typeof Attacks }[] = [];
        values.forEach(ceil => {
            const { x, y } = ceil;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (!(i === 0 && j === 0)) {
                        if (this.ships[y + j] && this.ships[y + j][x + i] === 0) {
                            this.ships[y + j][x + i] = -5;
                            resToUpdate.push({ 'x': y + j, 'y': x + i, status: Attacks[0] as keyof typeof Attacks })
                        }
                    }

                }
            }
        })
        return resToUpdate
    }
    public getInitialData(): ShipData {
        return this.initialData
    }
    public emitDeath(): void {
        this.ships.forEach((row, i) => row.forEach((cell, j) => {
            if (cell > 0) this.ships[i][j] *= -1;
        }));
        console.table(this.ships)
    }
    public isAlive(): boolean {
        return Array.isArray(this.ships.find((row: number[]) => row.find((cell: number) => cell > 0))) ?? false;
    }
    public checkAttack(x: number, y: number): string {
        const ceil = this.ships[y][x];

        if (ceil === 0) {
            this.ships[y][x] = -5;
            return Attacks[0]
        }
        const isKilled = this.checkIsKilled(ceil, x, y);

        if (ceil > 0 && ceil < 5 && isKilled.value) {
            this.ships[y][x] = ceil * -1;

            const emptyNeedToUpdate = this.getEmptyAfterKilled([{ x, y }, ...isKilled.needToUpdate.map(i => { return { x: i.y, y: i.x } })]);
            this.needUpdateKilled = [...isKilled.needToUpdate, ...emptyNeedToUpdate];
            return Attacks[2]
        };
        if (ceil > 0 && ceil < 5 && this.checkNearCeils(ceil, x, y)) {
            this.ships[y][x] = ceil * -1;
            return Attacks[1]
        };
        if (ceil > 0 && ceil < 5 && !this.checkNearCeils(ceil, x, y)) {
            this.ships[y][x] = ceil * -1;
            return Attacks[2]
        };
        if (ceil < 0) {
            return Attacks[3]
        }
        return Attacks[0]
    }
}
