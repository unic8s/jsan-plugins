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

        this.timeline = new window.TimelineLite({
            paused: true,
            repeat: -1,
            defaults: {
                ease: window.Circ.easeOut,
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
                {
                    x: x >= centerX ? this.dimensions.width - 1 : 0,
                    y: y >= centerY ? this.dimensions.height - 1 : 0,
                    delay: this.getRandomDelay()
                },
                {
                    x: Math.random() * this.dimensions.width,
                    y: Math.random() * this.dimensions.height,
                    delay: this.getRandomDelay()
                },
                {
                    x: x >= centerX ? this.dimensions.width - 1 : 0,
                    y: y,
                    delay: this.getRandomDelay()
                },
                {
                    x: x,
                    y: Math.sin(x / divider) * divider + centerY,
                    delay: this.getRandomDelay()
                },
                {
                    x: x / 2 + centerX / 2,
                    y: this.dimensions.height - (x * 1.5 - centerX) * (x * 1.5 - centerX) / this.dimensions.height,
                    delay: this.getRandomDelay()
                },
                {
                    x: Math.sin(x * y) * centerX + centerX,
                    y: Math.cos(x * y) * centerY + centerY,
                    delay: this.getRandomDelay()
                },
                {
                    x: centerX,
                    y: centerY,
                    delay: this.getRandomDelay()
                },
                {
                    x: x,
                    y: y,
                    delay: this.getRandomDelay()
                }
            ]);
        }

        for (let c = 0; c < this.list.length; c++) {
            const item = this.list[c];

            const posIndex = Math.random() * positions.length | 0;
            const position = this.random ? positions.splice(posIndex, 1)[0] : positions[c];

            requestAnimationFrame(() => {
                if(!this.timeline){
                    return;
                }

                this.timeline.to(item, {
                    duration: this.duration - position[0].delay,
                    x: position[0].x,
                    y: position[0].y
                }, position[0].delay);

                requestAnimationFrame(() => {
                    if(!this.timeline){
                        return;
                    }

                    this.timeline.to(item, {
                        duration: this.duration - position[1].delay,
                        x: position[1].x,
                        y: position[1].y
                    }, this.duration + position[1].delay);

                    requestAnimationFrame(() => {
                        if(!this.timeline){
                            return;
                        }

                        this.timeline.to(item, {
                            duration: this.duration - position[2].delay,
                            x: position[2].x,
                            y: position[2].y
                        }, this.duration * 2 + position[2].delay);

                        requestAnimationFrame(() => {
                            if(!this.timeline){
                                return;
                            }

                            this.timeline.to(item, {
                                duration: this.duration - position[3].delay,
                                x: position[3].x,
                                y: position[3].y
                            }, this.duration * 3 + position[3].delay);

                            requestAnimationFrame(() => {
                                if(!this.timeline){
                                    return;
                                }

                                this.timeline.to(item, {
                                    duration: this.duration - position[4].delay,
                                    x: position[4].x,
                                    y: position[4].y
                                }, this.duration * 4 + position[4].delay);

                                requestAnimationFrame(() => {
                                    if(!this.timeline){
                                        return;
                                    }

                                    this.timeline.to(item, {
                                        duration: this.duration - position[5].delay,
                                        x: position[5].x,
                                        y: position[5].y
                                    }, this.duration * 5 + position[5].delay);

                                    requestAnimationFrame(() => {
                                        if(!this.timeline){
                                            return;
                                        }

                                        this.timeline.to(item, {
                                            duration: this.duration - position[6].delay,
                                            x: position[6].x,
                                            y: position[6].y
                                        }, this.duration * 6 + position[6].delay);

                                        requestAnimationFrame(() => {
                                            if(!this.timeline){
                                                return;
                                            }

                                            this.timeline.to(item, {
                                                duration: this.duration - position[7].delay,
                                                x: position[7].x,
                                                y: position[7].y
                                            }, this.duration * 7 + position[7].delay);

                                            requestAnimationFrame(() => {
                                                if(!this.timeline){
                                                    return;
                                                }

                                                this.ready = true;

                                                this.timeline.play();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
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
