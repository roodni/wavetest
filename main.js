const screenW = 800;
const screenH = 800;
const waveW = 100;
const waveH = 100;


class Main {
    init() {
        this.wave = new WaveField();
        this.wave.init(waveW, waveH, 1.0, 30.0);
        this.wave.makeWave(20, 30, 1.0, 6.0);

        this.waveRenderer = new WaveRenderer();
        this.waveRenderer.init(this.wave);
    }
    update() {
        this.wave.step(1 / 60);
    }
    draw() {
        this.waveRenderer.render();
    }
    main() {
        const loop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(loop);
        }
        loop();
    }
}

const main = new Main();
window.addEventListener("load", () => {
    main.init();
    main.main();
});