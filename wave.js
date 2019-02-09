class WaveField {
    init(waveWNum, waveHNum, gridWidth, speed, decay) {
        this.waveWNum = waveWNum;
        this.waveHNum = waveHNum;
        this.gridWidth = gridWidth;
        this.speed = speed;
        this.decay = decay;

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
        x = Math.min(x, this.waveWNum - 1);
        x = Math.max(x, 0);
        y = Math.min(y, this.waveHNum - 1);
        y = Math.max(y, 0);
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

                this.uNew[i][j] = 2 * uCur - uPre + alpha * (uCurT + uCurB + uCurL + uCurR - 4 * uCur) - this.decay * timeStep * (uCur - uPre);
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
    add_u(x, y, height) {
        if (0 <= x && x < this.waveWNum && 0 <= y && y < this.waveHNum) {
            this.uCur[x][y] += height;
            this.uPre[x][y] += height;
        }
    }
    makeWave(x, y, height, radius) {
        for (let i = Math.floor(x - radius); i < x + radius; i++) {
            for (let j = Math.floor(y - radius); j < y + radius; j++) {
                let distRatio = Math.sqrt((i - x) * (i - x) + (j - y) * (j - y)) / radius;
                if (distRatio <= 1) {
                    this.add_u(i, j, height * Math.cos(Math.PI / 2 * distRatio));
                }
            }
        }
    }
    makeWaveX(x, height, radius) {
        for (let i = Math.floor(x - radius); i < x + radius; i++) {
            let distRatio = Math.abs(i - x) / radius;
            for (let j = 0; j < this.waveHNum; j++) {
                this.add_u(i, j, height * Math.cos(Math.PI / 2 * distRatio));
            }
        }
    }
}

class WaveRenderer {
    init(waveField, canvas) {
        this.waveField = waveField;

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });
        this.renderer.setSize(screenW, screenH);


        this.scene = new THREE.Scene();


        const waveW = this.waveField.waveWNum;
        const waveH = this.waveField.waveHNum;
        this.waveGeometory = new THREE.PlaneGeometry(waveW, waveH, waveW - 1, waveH - 1);

        const material = new THREE.MeshLambertMaterial({
            color: 0xccccFF,
            //wireframe: true
        });

        this.mesh = new THREE.Mesh(this.waveGeometory, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.scene.add(this.mesh);


        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(0, 100, waveH);
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
        this.scene.add(ambientLight);
        

        this.camera = new THREE.PerspectiveCamera(30, screenW / screenH);
        this.camera.position.set(0, 100, waveH * 1.5);
        this.camera.lookAt(0, 0, 0);

        this.raycaster = new THREE.Raycaster();
    }
    render() {
        this.mesh.rotation.z += 0.001;

        const geo = this.waveGeometory;
        const waveW = this.waveField.waveWNum;

        //ボトルネックくん
        for (let i = 0; i < geo.vertices.length; i++) {
            const vertex = geo.vertices[i];
            vertex.z = this.waveField.uCur[i % waveW][Math.floor(i / waveW)] * -10;
        }
        geo.verticesNeedUpdate = true;
        geo.computeFaceNormals();
        geo.computeVertexNormals();

        this.renderer.render(this.scene, this.camera);
    }
    click(x, y) {
        const mouse = new THREE.Vector2();
        mouse.x = x;
        mouse.y = y;
        
        this.raycaster.setFromCamera(mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            const localPos = this.mesh.worldToLocal(intersects[0].point);
            this.waveField.makeWave(localPos.x + this.waveField.waveWNum / 2, -localPos.y + this.waveField.waveHNum / 2, 1.0, 6.0);
        }
        
    }
}