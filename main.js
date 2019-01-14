const screenW = 600;
const screenH = 600;
const waveW = 100;
const waveH = 100;


class Main {
    init() {
        //試験的に2Dのcanvasを利用
        this.canvas = document.getElementById("mycanvas");
        this.canvas.width = screenW;
        this.canvas.height = screenH;
        this.context = this.canvas.getContext("2d");


        this.wave = new WaveField();
        this.wave.init(waveW, waveH, 1.0, 30.0);

        this.wave.makeWave(50, 50, 1.0, 6.0);
    }
    update() {
        this.wave.step(1 / 60);
    }
    draw() {
        let ctx = this.context;
        ctx.fillStyle = "rgb(0,0,0)"
        ctx.fillRect(0, 0, screenW, screenH);

        for (let i = 0; i < waveW; i++) {
            for (let j = 0; j < waveH; j++) {
                //ctx.fillStyle = "hsl(" + (this.wave.get_uCur(i, j) * 500) + ", 50%, 50%)";
                ctx.fillStyle = "hsl(0, 0%, " + (50 + this.wave.get_uCur(i, j) * 40) + "%)";
                ctx.fillRect(i * screenW / waveW, j * screenH / waveH, screenW / waveW, screenH / waveH);
            }
            // ctx.fillStyle = "rgb(255,255,255)";
            // ctx.fillRect(i * screenW / waveW, 0, screenW / waveW, screenH / 2 - 100 * this.wave.get_uCur(i, 50));
        }
    }
    main() {
        const loop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }
}

const main = new Main();
window.addEventListener("load", () => {
    main.init();
    main.main();
});