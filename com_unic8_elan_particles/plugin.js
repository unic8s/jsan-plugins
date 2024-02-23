module.exports = {
    options: null,
    dimensions: null,
    container: null,
    emitterContainer: null,
    emitter: null,
    elapsed: Date.now(),
    mode: 0,
    speed: 20,
    duration: 2,
    particlePath: 'assets/particle.png',
    amount: 1000,
    texturize: false,
    fileID: null,
    colorize: false,
    color: "#FFFFFF",
    center: { x: 0, y: 0, width: 0, height: 0 },
    blendMode: "NORMAL",

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        const PIXI = options.PIXI.module;

        this.container = options.PIXI.instance;

        this.emitterContainer = new PIXI.ParticleContainer();
        this.container.addChild(this.emitterContainer);

        this.fileID = this.options.files[this.particlePath];

        this.build();
    },
    uninstall: function () {
        this.emitter.destroy();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.build();
    },
    blend: function (mode) {
        const PIXI = this.options.PIXI.module;

        this.blendMode = mode > 0 ? PIXI.BLEND_MODES[mode] : "NORMAL";

        this.build();
    },
    input: function (id, data) {
        const list = this.emitter.initBehaviors;

        switch (id) {
            case "mode":
                if(data < 0){
                    data = 0;
                }else if(data > 2){
                    data = 2;
                }

                this.mode = data;
                break;
            case "speed":
                this.speed = data;
                break;
            case "duration":
                this.duration = data;
                break;
            case "center":
                this.center = data;

                var spawnBounds = this.getSpawnBounds();

                switch (this.mode) {
                    case 0:
                        for (let c = 0; c < list.length; c++) {
                            const item = list[c];

                            if (item.constructor.name == "ShapeSpawnBehavior") {
                                item.shape = spawnBounds;

                                break;
                            }
                        }
                        break;
                    case 2:
                        this.emitter.spawnPos = spawnBounds;
                        break;
                }
                break;
            case "amount":
                this.amount = data;

                this.emitter.maxParticles = this.amount;
                return;
            case "texturize":
                this.texturize = data;
                break;
            case "particle":
                this.fileID = data;
                break;
            case "colorize":
                this.colorize = data;
                break;
            case "color":
                this.color = data;

                if (this.colorize) {
                    for (let c = 0; c < list.length; c++) {
                        const item = list[c];

                        if (item.constructor.name == "StaticColorBehavior") {
                            item.value = this.convertColor(this.color);
                        }
                    }
                }
                return;
        }

        this.build();
    },

    build: function () {
        if (this.emitter) {
            this.emitter.destroy();
            this.emitter = null;
        }

        const PIXI = this.options.PIXI.module;

        const config = {
            emitterLifetime: -1,
            lifetime: {
                min: this.duration / 10,
                max: this.duration
            },
            frequency: 0.008,
            maxParticles: this.amount,
            autoUpdate: true,
            behaviors: [
                {
                    type: "alpha",
                    config: {
                        alpha: {
                            list: [
                                {
                                    time: 0,
                                    value: 0
                                },
                                {
                                    time: this.duration / 10,
                                    value: 1
                                },
                                {
                                    time: this.duration,
                                    value: 0
                                }
                            ]
                        }
                    }
                },
                {
                    type: "moveSpeed",
                    config: {
                        speed: {
                            list: [
                                {
                                    time: 0,
                                    value: this.speed
                                },
                                {
                                    time: this.duration,
                                    value: this.speed / 10
                                }
                            ]
                        }
                    }
                },
                {
                    type: "rotationStatic",
                    config: {
                        "min": 0,
                        "max": 360,
                    }
                },
                {
                    type: "blendMode",
                    config: {
                        "blendMode": this.blendMode
                    }
                },
                {
                    type: "scale",
                    config: {
                        scale: {
                            list: [
                                {
                                    time: 0,
                                    value: 0.01
                                },
                                {
                                    time: 0.25,
                                    value: 0.1
                                },
                                {
                                    time: this.duration,
                                    value: 0.01
                                }
                            ]
                        },
                        minMult: 1
                    }
                },
                {
                    type: 'textureSingle',
                    config: {
                        texture: this.texturize ? PIXI.Texture.from(this.fileID) : PIXI.Texture.WHITE
                    }
                }
            ]
        };

        if (this.colorize) {
            config.behaviors.push({
                type: 'colorStatic',
                config: {
                    color: this.color
                },
            });
        }

        let spawnBehavior;
        const spawnBounds = this.getSpawnBounds();

        switch (this.mode) {
            case 0:
                spawnBehavior = {
                    type: "spawnShape",
                    config: {
                        type: "rect",
                        data: spawnBounds
                    }
                };
                break;
            case 1:
                spawnBehavior = {
                    type: "spawnShape",
                    config: {
                        type: "torus",
                        data: spawnBounds
                    }
                };
                break;
            case 2:
                spawnBehavior = {
                    type: "spawnPoint",
                    config: {}
                };

                config.pos = spawnBounds;
                break;
        }

        config.behaviors.push(spawnBehavior);

        const PIXI_Particles = this.options.PIXI.particles;

        this.emitter = new PIXI_Particles.Emitter(
            this.emitterContainer,
            config
        );

        this.emitter.emit = true;
    },
    getSpawnBounds() {
        switch (this.mode) {
            case 0:
                return {
                    x: this.center.x,
                    y: this.center.y,
                    w: this.center.width > 0 ? this.center.width : this.dimensions.width,
                    h: this.center.height > 0 ? this.center.height : this.dimensions.height
                };
            case 1:
                var radiusX = (this.center.width > 0 ? this.center.width : this.dimensions.width) >> 1;
                var radiusY = (this.center.height > 0 ? this.center.height : this.dimensions.height) >> 1;
                var radius = Math.min(radiusX, radiusY);

                return {
                    x: ((this.center.width > 0 ? this.center.width : this.dimensions.width) - this.center.x) >> 1,
                    y: ((this.center.height > 0 ? this.center.height : this.dimensions.height) - this.center.y) >> 1,
                    radius: radius,
                    innerRadius: radius >> 1
                };
            case 2:
                return {
                    x: ((this.center.width > 0 ? this.center.width : this.dimensions.width) - this.center.x) >> 1,
                    y: ((this.center.height > 0 ? this.center.height : this.dimensions.height) - this.center.y) >> 1
                };
        }
    },
    convertColor: function (hex) {
        const result = parseInt(hex.replace("#", "0x"), 16);

        return isNaN(result) ? 0 : result;
    }
}