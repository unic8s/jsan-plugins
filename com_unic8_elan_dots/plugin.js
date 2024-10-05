module.exports = {
    options: null,
    dimensions: null,
    container: null,
    PIXI: null,
    sprite: null,
    canvas: null,
    context: null,
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

    build: function () {
        this.killTweens();

        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.context.globalAlpha = 1;

        this.timeline = new this.options.GSAP.TimelineLite({
            paused: true,
            repeat: -1,
            defaults: {
                ease: this.options.GSAP.Circ.easeOut,
                roundProps: 'x,y'
            }
        });

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
    getRandomDelay() {
        return Math.random() * (this.duration - this.duration / 5) + this.duration / 10;
    },
    addTweens: function () {
        const positions = [];

        for (let c = 0; c < this.list.length; c++) {
            const item = this.list[c];
            const x = item.x;
            const y = item.y;

            const centerX = this.dimensions.width >> 1;
            const centerY = this.dimensions.height >> 1;
            const divider = Math.sqrt(this.dimensions.width);

            positions.push([
                { // 0
                    x: x >= centerX ? this.dimensions.width - 1 : 0,
                    y: y >= centerY ? this.dimensions.height - 1 : 0,
                    delay: this.getRandomDelay()
                },
                { // 1
                    x: Math.random() * this.dimensions.width,
                    y: Math.random() * this.dimensions.height,
                    delay: this.getRandomDelay()
                },
                { // 2
                    x: x >= centerX ? this.dimensions.width - 1 : 0,
                    y: y,
                    delay: this.getRandomDelay()
                },
                { // 3
                    x: x,
                    y: Math.sin(x / divider) * divider + centerY,
                    delay: this.getRandomDelay()
                },
                { // 4
                    x: (x >> 1) + (this.dimensions.width >> 2),
                    y: (y >> 1) + (this.dimensions.height >> 2),
                    delay: this.getRandomDelay()
                },
                { // 5
                    x: y,
                    y: y,
                    delay: this.getRandomDelay()
                },
                { // 6
                    x: Math.sqrt(x * y),
                    y: y,
                    delay: this.getRandomDelay()
                },
                { // 7
                    x: x / 2 + centerX / 2,
                    y: this.dimensions.height - Math.pow(x * 1.5 - centerX, 2) / this.dimensions.height,
                    delay: this.getRandomDelay()
                },
                { // 8
                    x: Math.sin(x * y) * centerX + centerX,
                    y: Math.cos(x * y) * centerY + centerY,
                    delay: this.getRandomDelay()
                },
                { // 9
                    x: centerX,
                    y: centerY,
                    delay: this.getRandomDelay()
                },
                { // 10
                    x: x,
                    y: y,
                    delay: this.getRandomDelay()
                }
            ]);
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
    addAnimation: function (item, index, x, y, position, offset) {
        requestAnimationFrame(() => {
            if (!this.timeline) {
                return;
            }
            
            if(offset < position.length) {
                this.timeline.to(item, {
                    duration: this.duration - position[offset].delay,
                    x: offset < position.length - 1 ? position[offset].x : x,
                    y: offset < position.length - 1 ? position[offset].y : y
                }, this.duration * offset + position[offset].delay);
    
                this.addAnimation(item, index, x, y, position, ++offset);
            }else if(index == this.list.length - 1){
                this.ready = true;

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
            this.context.fillRect(gfx.x, gfx.y, 1, 1);
        }

        this.sprite.texture.update();
    }
}