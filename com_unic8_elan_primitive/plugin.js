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
    materialColor: null,
    materialImage: null,
    auto: null,
    tweens: [],
    killed: false,

    install: function (options) {
        this.options = options;
        
        const inputs = this.options.inputs;

        this.dimensions = this.options.params.canvas;

        this.color = this.convertColor(inputs.color);
        this.auto = inputs.auto;

        const THREE = options.THREE.module;
        this.container3D = options.THREE.instance;

        this.container = options.PIXI.instance;
        this.render3D = options.THREE.render;
        this.resize3D = options.THREE.resize;

        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.decay = 0;
        spotLight.position.set(16, 16, 64);
        this.container3D.add(spotLight);

        this.materialColor = new THREE.MeshStandardMaterial({
            color: this.color
        });

        this.materialImage = new THREE.MeshStandardMaterial({
            transparent: true
        });

        let texture = new THREE.DataTexture(null, this.dimensions.width, this.dimensions.height);
        this.materialImage.map = texture;

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
                this.materialColor.color.set(this.convertColor(data));
                break;
            case "image":
                this.materialImage.map = new THREE.TextureLoader().load(data);
                break;
            case "opacity":
                this.materialImage.opacity = data;
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
        const dimension = 20;

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
                geometry = new THREE.TorusKnotGeometry(dimension >> 1, 3, 128, 16);
                break;
        }

        if (!geometry) {
            this.stop();
            return;
        }

        geometry.clearGroups();
        geometry.addGroup(0, Infinity, 0);
        geometry.addGroup(0, Infinity, 1);

        this.primitive = new THREE.Mesh(geometry, [this.materialColor, this.materialImage]);
        this.container3D.add(this.primitive);

        const inputs = this.options.inputs;

        this.primitive.rotation.x = THREE.MathUtils.degToRad(inputs.rotationX);
        this.primitive.rotation.y = THREE.MathUtils.degToRad(inputs.rotationY);
        this.primitive.rotation.z = THREE.MathUtils.degToRad(inputs.rotationZ);

        if (this.auto) {
            this.animate();
        }
    },
    stop: function () {
        for (let c in this.tweens) {
            this.tweens[c].kill();
        }

        this.tweens = [];
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

        this.tweens[axis] = this.options.GSAP.TweenLite.to(this.primitive.rotation, diff, params);
    },
    convertColor: function (hex) {
        const result = parseInt(hex.replace("#", "0x"), 16);

        return isNaN(result) ? 0 : result;
    }
}
