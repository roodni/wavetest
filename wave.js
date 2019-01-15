class WaveField {
    init(waveWNum, waveHNum, gridWidth, speed) {
        this.waveWNum = waveWNum;
        this.waveHNum = waveHNum;
        this.gridWidth = gridWidth;
        this.speed = speed;

        this.uPre = [];
        this.uCur = [];
        this.uNew = [];

        for (let i = 0; i < this.waveWNum; i++) {
            this.uPre[i] = [];
            this.uCur[i] = [];
            this.uNew[i] = [];
            for (let j = 0; j < this.waveHNum; j++) {
                this.uPre[i][j] = 0;
                this.uCur[i][j] = 0;
                this.uNew[i][j] = 0;
            }
        }
    }
    get_uCur(x, y) {
        if (x < 0 || this.waveWNum <= x || y < 0 || this.waveHNum <= y) {
            return 0;
        } else {
            return this.uCur[x][y];
        }
    }
    step(timeStep) {
        let alpha = Math.pow(timeStep * this.speed / this.gridWidth, 2);

        for (let i = 0; i < this.waveWNum; i++) {
            for (let j = 0; j < this.waveHNum; j++) {
                let uCur = this.get_uCur(i, j);
                let uCurL = this.get_uCur(i - 1, j);
                let uCurR = this.get_uCur(i + 1, j);
                let uCurT = this.get_uCur(i, j - 1);
                let uCurB = this.get_uCur(i, j + 1);
                let uPre = this.uPre[i][j];

                this.uNew[i][j] = 2 * uCur - uPre + alpha * (uCurT + uCurB + uCurL + uCurR - 4 * uCur);
            }
        }
        [this.uNew, this.uCur, this.uPre] = [this.uPre, this.uNew, this.uCur];
    }

    set_u(x, y, height) {
        if (0 <= x && x < this.waveWNum && 0 <= y && y < this.waveHNum) {
            this.uCur[x][y] = height;
            this.uPre[x][y] = height;
        }
    }
    makeWave(x, y, height, radius) {
        for (let i = Math.floor(x - radius); i < x + radius; i++) {
            for (let j = Math.floor(y - radius); j < y + radius; j++) {
                let distRatio = Math.sqrt((i - x) * (i - x) + (j - y) * (j - y)) / radius;
                if (distRatio <= 1) {
                    this.set_u(i, j, height * Math.cos(Math.PI / 2 * distRatio));
                }
            }
        }
    }
}