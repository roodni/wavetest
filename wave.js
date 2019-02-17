class WaveField {
    init(waveWNum, waveHNum, gridWidth, speed, decay) {
        this.waveWNum = waveWNum;
        this.waveHNum = waveHNum;
        this.gridWidth = gridWidth;
        this.speed = speed;
        this.decay = decay;

        this.lastTimeStep = 1 / 60;

        this.uPre = [];
        this.uCur = [];
        this.uNew = [];
        for (let i = 0; i < this.waveWNum; i++) {
            this.uPre[i] = new Array(this.waveHNum).fill(0);
            this.uCur[i] = new Array(this.waveHNum).fill(0);
            this.uNew[i] = new Array(this.waveHNum).fill(0);
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

        this.lastTimeStep = timeStep;
    }

    makeWave(x, y, height, radius) {
        // 新たに生成する波を表す関数
        const f = (x, y, height, radius) => {
            let distRatio = Math.sqrt(x * x + y * y) / radius;
            if (distRatio <= 1) {
                let cos = Math.cos(Math.PI / 2 * distRatio);
                return height * cos * cos;
            } else {
                return 0;
            }
        }

        // 追加
        for (let i = Math.floor(x - radius); i <= x + radius; i++) {
            for (let j = Math.floor(y - radius); j <= y + radius; j++) {
                if (0 <= i && i < this.waveWNum && 0 <= j && j < this.waveHNum) {
                    let C = f(i - x, j - y, height, radius);
                    let L = f(i - x - 1, j - y, height, radius);
                    let R = f(i - x + 1, j - y, height, radius);
                    let T = f(i - x, j - y - 1, height, radius);
                    let B = f(i - x, j - y + 1, height, radius);
                    this.uPre[i][j] += C;
                    let keisu = Math.pow(this.lastTimeStep * this.speed / this.gridWidth, 2) / 2;
                    this.uCur[i][j] += C + keisu * (L + R + T + B - 4 * C);
                }
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
        directionalLight.position.set(0, waveH, waveH);
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
        this.scene.add(ambientLight);
        

        this.camera = new THREE.PerspectiveCamera(30, screenW / screenH);
        this.camera.position.set(0, waveH, waveH * 1.5);
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
            vertex.z = this.waveField.uCur[i % waveW][Math.floor(i / waveW)] * 10;
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