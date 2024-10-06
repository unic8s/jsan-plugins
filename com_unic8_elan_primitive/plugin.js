module.exports = {
    options: null,
    dimensions: null,
    shape: 0,
    color: null,
    primitive: null,
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

        this.color = this.convertColor(options.nodes.inputs.query("color").data);
        this.auto = options.nodes.inputs.query("auto").data;

        const THREE = options.THREE.module;
        this.container3D = options.THREE.instance;

        this.container = options.PIXI.instance;
        this.render3D = options.THREE.render;
        this.resize3D = options.THREE.resize;

        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.decay = 0;
        spotLight.position.set(16, 16, 64);
        this.container3D.add(spotLight);

        this.material = new THREE.MeshStandardMaterial({
            color: this.color
        });

        this.addPrimitive();

        if (this.auto) {
            this.animate();
        }
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.resize3D(this.dimensions);

        var scale = 1 / this.dimensions.multiplier3d;

        //this.container.scale.set(scale, scale);
    },
    render: function () {
        this.render3D(this.dimensions, this.container3D, this.container);
    },
    input: function (id, data) {
        const THREE = this.options.THREE.module;

        switch (id) {
            case "shape":
                this.shape = data;

                this.addPrimitive();
                break;
            case "auto":
                this.auto = data;

                if (this.auto) {
                    this.animate();
                } else {
                    this.stop();
                }
                break;
            case "rotationX":
                this.primitive.rotation.x = THREE.MathUtils.degToRad(data);
                break;
            case "rotationY":
                this.primitive.rotation.y = THREE.MathUtils.degToRad(data);
                break;
            case "rotationZ":
                this.primitive.rotation.z = THREE.MathUtils.degToRad(data);
                break;
            case "color":
                this.material.color.set(this.convertColor(data));
                break;
        }
    },
    uninstall: function () {
        this.killed = true;

        this.stop();
    },

    addPrimitive: function () {
        const THREE = this.options.THREE.module;

        if (this.primitive) {
            this.container3D.remove(this.primitive);

            this.primitive = null;
        }

        let geometry;
        const dimension = Math.max(this.dimensions.width, this.dimensions.height) >> 2;

        switch (this.shape) {
            case 0:
                geometry = new THREE.BoxGeometry(dimension, dimension, dimension);
                break;
            case 1:
                geometry = new THREE.ConeGeometry(dimension >> 1, dimension, dimension);
                break;
            case 2:
                geometry = new THREE.CylinderGeometry(dimension >> 1, dimension >> 1, dimension, dimension);
                break;
            case 3:
                geometry = new THREE.TorusGeometry(dimension >> 1, dimension >> 2, dimension, dimension);
                break;
            case 4:
                geometry = new THREE.TorusKnotGeometry(10, 3, 128, 16);
                break;
        }

        if (!geometry) {
            this.stop();
            return;
        }

        this.primitive = new THREE.Mesh(geometry, this.material);
        this.container3D.add(this.primitive);

        this.primitive.rotation.x = THREE.MathUtils.degToRad(this.options.nodes.inputs.query("rotationX").data);
        this.primitive.rotation.y = THREE.MathUtils.degToRad(this.options.nodes.inputs.query("rotationY").data);
        this.primitive.rotation.z = THREE.MathUtils.degToRad(this.options.nodes.inputs.query("rotationZ").data);

        if (this.auto) {
            this.animate();
        }
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

        const params = {
            ease: this.options.GSAP.Quad.easeInOut,
            onComplete: () => {
                if (refThis.auto) {
                    refThis.animteAxis(axis);
                }
            }
        };

        params[axis] = this.primitive.rotation[axis] + THREE.MathUtils.degToRad(Math.random() * 720 - 360);

        const diff = Math.abs(params[axis] - this.primitive.rotation[axis]);

        this["tween_" + axis] = this.options.GSAP.TweenLite.to(this.primitive.rotation, diff, params);
    },
    convertColor: function (hex) {
        const result = parseInt(hex.replace("#", "0x"), 16);

        return isNaN(result) ? 0 : result;
    }
}