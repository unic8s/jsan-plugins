module.exports = {
    options: null,
    dimensions: null,
    container: null,
    PIXI: null,
    sprite: null,
    canvas: null,
    context: null,
    size: 1,
    modulo: 4,
    duration: 8,
    smooth: false,
    list: [],
    scheme: 0,
    trail: 1,
    random: false,
    timeline: null,
    timeoutID: null,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;
        this.container = options.PIXI.instance;

        this.PIXI = options.PIXI.module;

        this.sprite = new this.PIXI.Sprite();
        this.sprite.pivot.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.sprite.position.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.container.addChild(this.sprite);

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.context = this.canvas.getContext("2d", {
            willReadFrequently: true
        });

        this.sprite.texture = this.PIXI.Texture.from(this.canvas);

        this.build();
    },
    uninstall: function () {
        this.killTweens();
    },
    input: function (id, data) {
        switch (id) {
            case "size":
                this.size = data > 1 ? data : 1;
                break;
            case "modulo":
                this.modulo = data > 0 ? data : 1;
                break;
            case "duration":
                this.duration = data;
                break;
            case "scheme":
                this.scheme = data;
                break;
            case "trail":
                this.trail = data > 0 ? data : 1;
                break;
            case "random":
                this.random = data;
                break;
        }

        this.build();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.sprite.texture.destroy(true);
        this.sprite.texture = this.PIXI.Texture.from(this.canvas);
        this.sprite.pivot.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.sprite.position.set(this.dimensions.width >> 1, this.dimensions.height >> 1);

        this.build();
    },
    blend: function (mode) {
        this.sprite.blendMode = mode;
    },
    render: function () {
        this.draw();
    },

    build: async function () {
        this.buildTimeline();

        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.context.globalAlpha = 1;

        this.list = [];

        const centerX = this.dimensions.width >> 1;
        const centerY = this.dimensions.height >> 1;

        for (let x = 0; x < this.dimensions.width; x++) {
            for (let y = 0; y < this.dimensions.height; y++) {
                if (x % this.modulo == 0 && y % this.modulo == 0) {
                    let color = 0xFFFFFF;

                    switch (this.scheme) {
                        case 1:
                            if (x < centerX) {
                                if (y < centerY) {
                                    color = 0xFF0000;
                                } else {
                                    color = 0x00FF00;
                                }
                            } else {
                                if (y < centerY) {
                                    color = 0x0000FF;
                                }
                            }
                            break;
                        case 2:
                            color = Math.random() * 0xFFFFFF | 0;
                            break;
                        case 3:
                            var shiftX = x * (64 / this.dimensions.width);
                            var shiftY = y * (64 / this.dimensions.height);

                            color = (shiftX << 18) | (shiftY << 10) | (0xFF << 4);
                            break;
                    }

                    color = color.toString(16);

                    while (color.length < 6) {
                        color = "0" + color;
                    }

                    const gfx = {
                        x: x,
                        y: y,
                        color: "#" + color
                    }

                    this.list.push(gfx);
                }
            }
        }

        requestAnimationFrame(() => {
            this.addTweens();
        });
    },
    buildTimeline() {
        this.killTweens();

        this.timeline = new this.options.GSAP.TimelineLite({
            paused: true,
            repeat: -1
        });
    },
    getRandomDelay() {
        return Math.random() * (this.duration - this.duration / 5) + this.duration / 10;
    },
    addTweens: function () {
        let positions = [];

        for (let c1 = 0; c1 < this.list.length; c1++) {
            const item = this.list[c1];
            const x = item.x;
            const y = item.y;

            const fx = [];

            for (let c2 = 0; c2 < 11; c2++) {
                fx.push(this.generateFX(c2, x, y));
            }

            positions.push(fx);
        }

        for (let c = 0; c < this.list.length; c++) {
            const item = this.list[c];
            const x = item.x;
            const y = item.y;

            const posIndex = Math.random() * positions.length | 0;
            const position = this.random ? positions.splice(posIndex, 1)[0] : positions[c];

            this.addAnimation(item, c, x, y, position, 0);
        }
    },
    generateFX(index, x, y) {
        let data;

        const centerX = this.dimensions.width >> 1;
        const centerY = this.dimensions.height >> 1;
        const divider = Math.sqrt(this.dimensions.width);

        switch (index) {
            case 0:
                data = { // sides
                    x: x >= centerX ? this.dimensions.width - this.size : 0,
                    y: y >= centerY ? this.dimensions.height - this.size : 0
                };
                break;
            case 1:
                data = { // chaos
                    x: Math.random() * this.dimensions.width,
                    y: Math.random() * this.dimensions.height
                };
                break;
            case 2:
                data = { // edges
                    x: x >= centerX ? this.dimensions.width - this.size : 0,
                    y: y
                };
                break;
            case 3:
                data = { // sine
                    x: x,
                    y: Math.sin(x / divider) * divider + centerY + Math.sqrt(y)
                };
                break;
            case 4:
                data = { // block
                    x: (x >> 1) + (this.dimensions.width >> 2),
                    y: (y >> 1) + (this.dimensions.height >> 2)
                };
                break;
            case 5:
                data = { // diagonal
                    x: y,
                    y: y
                };
                break;
            case 6:
                data = { // sphere
                    x: Math.sqrt(x * y),
                    y: y
                };
                break;
            case 7:
                data = { // parabel
                    x: x / 2 + centerX / 2,
                    y: this.dimensions.height - Math.pow(x * 1.5 - centerX, 2) / this.dimensions.height
                };
                break;
            case 8:
                data = { // circle
                    x: Math.sin(x * y) * centerX + centerX,
                    y: Math.cos(x * y) * centerY + centerY
                };
                break;
            case 9:
                data = { // center
                    x: centerX,
                    y: centerY
                };
                break;
            case 10:
                data = { // origin
                    x: x,
                    y: y
                };
                break;
        }

        data.delay = this.getRandomDelay();

        return data;
    },
    addAnimation: function (item, index, x, y, position, offset) {
        requestAnimationFrame(() => {
            if (!this.timeline) {
                return;
            }

            if (offset < position.length) {
                this.timeline.to(item, {
                    duration: this.duration - position[offset].delay,
                    x: offset < position.length - 1 ? position[offset].x : x,
                    y: offset < position.length - 1 ? position[offset].y : y,
                    ease: this.options.GSAP.Circ.easeOut
                }, this.duration * offset + position[offset].delay);

                this.addAnimation(item, index, x, y, position, ++offset);
            } else if (index == this.list.length - 1) {
                this.timeline.play();
            }
        });
    },
    killTweens: function () {
        if (!this.timeline) {
            return;
        }

        this.timeline.kill();
        this.timeline = null;
    },
    draw: function () {
        this.context.globalAlpha = 1 / (this.trail * 2);
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.context.globalAlpha = 1;

        for (let c = 0; c < this.list.length; c++) {
            const gfx = this.list[c];

            this.context.fillStyle = gfx.color;
            this.context.fillRect(gfx.x, gfx.y, this.size, this.size);
        }

        this.sprite.texture.update();
    }
}