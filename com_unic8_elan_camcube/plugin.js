module.exports = {
    options: null,
    dimensions: null,
    cube: null,
    container: null,
    container3d: null,
    render3D: null,
    resize3D: null,
    material: null,
    auto: null,
    tween_x: null,
    tween_y: null,
    tween_z: null,
    killed: false,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        this.auto = options.inputs.auto;

        const THREE = options.THREE.module;
        this.container3D = options.THREE.instance;

        this.container = options.PIXI.instance;
        this.render3D = options.THREE.render;
        this.resize3D = options.THREE.resize;

        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.decay = 0;
        spotLight.position.set(16, 16, 64);
        this.container3D.add(spotLight);

        const geometry = new THREE.BoxGeometry(20, 20, 20);

        this.material = new THREE.MeshStandardMaterial({});

        let texture = new THREE.DataTexture(null, this.dimensions.width, this.dimensions.height);
        this.material.map = texture;

        this.cube = new THREE.Mesh(geometry, this.material);
        this.container3D.add(this.cube);

        this.cube.rotation.x = THREE.MathUtils.degToRad(options.inputs.rotationX);
        this.cube.rotation.y = THREE.MathUtils.degToRad(options.inputs.rotationY);
        this.cube.rotation.z = THREE.MathUtils.degToRad(options.inputs.rotationZ);

        if (this.auto) {
            this.animate();
        }
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.resize3D(this.dimensions);

        this.material.map.dispose();

        const THREE = this.options.THREE.module;

        let texture = new THREE.DataTexture(null, this.dimensions.width, this.dimensions.height);
        this.material.map = texture;

        var scale = 1 / this.dimensions.multiplier3d;

        //this.container.scale.set(scale, scale);
    },
    render: function () {
        this.render3D(this.dimensions, this.container3D, this.container);
    },
    input: function (id, data) {
        const THREE = this.options.THREE.module;

        switch (id) {
            case "auto":
                this.auto = data;

                if (this.auto) {
                    this.animate();
                } else {
                    this.stop();
                }
                break;
            case "rotationX":
                this.cube.rotation.x = THREE.MathUtils.degToRad(data);
                break;
            case "rotationY":
                this.cube.rotation.y = THREE.MathUtils.degToRad(data);
                break;
            case "rotationZ":
                this.cube.rotation.z = THREE.MathUtils.degToRad(data);
                break;
        }
    },
    cameraUpdate: function (event) {
        this.material.map.image = event.data;
        this.material.map.needsUpdate = true;
    },
    cameraActive: function () {
        this.container.visible = true;
    },
    cameraInactive: function () {
        this.container.visible = false;
    },
    uninstall: function () {
        this.killed = true;

        this.stop();
    },

    stop: function () {
        if (this.tween_x) {
            this.tween_x.kill();
            this.tween_y.kill();
            this.tween_z.kill();

            this.tween_x = null;
            this.tween_y = null;
            this.tween_z = null;
        }
    },
    animate: function () {
        this.stop();

        this.animteAxis("x");
        this.animteAxis("y");
        this.animteAxis("z");
    },
    animteAxis: function (axis) {
        if (this.killed) {
            return;
        }

        const refThis = this;
        const THREE = this.options.THREE.module;
        const GSAP = this.options.GSAP;

        const params = {
            ease: GSAP.Quad.easeInOut,
            onComplete: () => {
                if (refThis.auto) {
                    refThis.animteAxis(axis);
                }
            }
        };

        params[axis] = this.cube.rotation[axis] + THREE.MathUtils.degToRad(Math.random() * 720 - 360);

        const diff = Math.abs(params[axis] - this.cube.rotation[axis]);

        this["tween_" + axis] = GSAP.TweenLite.to(this.cube.rotation, diff, params);
    }
}
