import { ShipData } from "./dbTypes";

export class RandomField {
    boardMatrix: number[][] = [
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
    ships: ShipData = [];

    constructor() {
        this.placeShipsRandomly();
    }

    public getShipsData(): ShipData {
        return this.ships as ShipData;
    }

    private generateRandomCoordinates(): { x: number, y: number } {
        const x = Math.floor(Math.random() * (this.boardMatrix.length - 1));
        const y = Math.floor(Math.random() * (this.boardMatrix.length - 1));
        return { x, y };
    }

    private canPlaceShip(x: number, y: number, l: number, direction: boolean) {
        if ((direction ? x + l - 1 : y + l - 1) > 9) return false;
        if (this.boardMatrix[x][y] !== 0) return false;

        for (let i = x - 1; i <= (direction ? x + l : x + 1); i++) {
            for (let j = y - 1; j <= (direction ? y + 1 : y + l); j++) {
                if (i >= 0 && j >= 0 && i <= 9 && j <= 9 && this.boardMatrix[i]) {

                    if (this.boardMatrix[i][j] !== 0) return false;
                }
            }
        }

        return true;
    }



    private placeShipsRandomly(): void {
        const shipCounts = [1, 2, 3, 4];
        for (const count of shipCounts) {
            for (let i = 0; i < count; i++) {
                const type = this.getShipType(count);
                const direction = false;

                let length = 0;
                switch (type) {
                    case "small":
                        length = 1;
                        break;
                    case "medium":
                        length = 2;
                        break;
                    case "large":
                        length = 3;
                        break;
                    case "huge":
                        length = 4;
                        break;
                }
                let x, y;
                let canPlace = false;
                while (!canPlace) {
                    ({ x, y } = this.generateRandomCoordinates());
                    canPlace = this.canPlaceShip(x, y, length, direction);
                }

                this.ships.push({ position: { y: x as number, x: y as number }, direction, length, type });

                for (let i = 0; i < length; i++) {
                    if (direction) {
                        this.boardMatrix[x as number + i][y as number] = length;
                    } else {
                        this.boardMatrix[x as number][y as number + i] = length;
                    }
                }
            }
        }
    }

    private getShipType(length: number): "small" | "medium" | "large" | "huge" {
        switch (length) {
            case 4:
                return "small";
            case 3:
                return "medium";
            case 2:
                return "large";
            case 1:
                return "huge";
            default:
                return "small";
        }
    }
}
