class Main {
    init() {
    }
    update() {
    }
    draw() {
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

window.addEventListener("load", () => {
    const main = new Main();
    main.init();
    main.main();
});