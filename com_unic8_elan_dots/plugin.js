module.exports = {
    options: null,
    dimensions: null,
    container: null,
    modulo: 4,
    duration: 8,
    smooth: false,
    list: [],
    root: null,
    scheme: 0,
    timeline: null,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;
        this.container = options.PIXI.instance;

        const PIXI = this.options.PIXI.module;

        this.root = new PIXI.Sprite();
        this.root.pivot.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.root.position.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.container.addChild(this.root);

        this.build();
    },
    uninstall: function () {
        this.killTweens();
    },
    input: function (id, data) {
        switch (id) {
            case "modulo":
                this.modulo = data > 1 ? data : 2;
                break;
            case "duration":
                this.duration = data;
                break;
            case "scheme":
                this.scheme = data;
                break;
        }

        this.build();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.root.position.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.root.pivot.set(this.dimensions.width >> 1, this.dimensions.height >> 1);

        this.build();
    },
    blend: function (mode) {
        for (let c = 0; c < this.list.length; c++) {
            const item = this.list[c];
            item.blendMode = mode;
        }
    },

    build: function () {
        this.killTweens();

        this.timeline = new window.TimelineLite({
            paused: true,
            repeat: -1,
            defaults: {
                ease: window.Circ.easeOut,
                roundProps: 'x,y'
            }
        });

        for (let c = 0; c < this.list.length; c++) {
            const item = this.list[c];

            this.root.removeChild(item);
        }

        this.list = [];

        const centerX = this.dimensions.width >> 1;
        const centerY = this.dimensions.height >> 1;

        const PIXI = this.options.PIXI.module;

        for (let x = 0; x < this.dimensions.width; x++) {
            for (let y = 0; y < this.dimensions.height; y++) {
                if (x % this.modulo == 0 && y % this.modulo == 0) {
                    const gfx = new PIXI.Graphics();
                    gfx.x = x;
                    gfx.y = y;

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
                            color = Math.random() * 0xFFFFFF;
                            break;
                        case 3:
                            var shiftX = x * (64 / this.dimensions.width);
                            var shiftY = y * (64 / this.dimensions.height);

                            color = (shiftX << 18) | (shiftY << 10) | (0xFF << 4);
                            break;
                    }

                    gfx.beginFill(color);
                    gfx.drawRect(0, 0, 1, 1);

                    this.root.addChild(gfx);

                    this.list.push(gfx);
                }
            }
        }

        requestAnimationFrame(() => {
            this.addTweens();
            this.timeline.play();
        });
    },
    addTweens: function () {
        for (let c = 0; c < this.list.length; c++) {
            const item = this.list[c];
            const x = item.x;
            const y = item.y;

            const delay = Math.random() * (this.duration - this.duration / 5) + this.duration / 10;

            const centerX = this.dimensions.width >> 1;
            const centerY = this.dimensions.height >> 1;

            this.timeline.to(item, {
                duration: this.duration - delay,
                x: x >= centerX ? this.dimensions.width - 1 : 0,
                y: y >= centerY ? this.dimensions.height - 1 : 0
            }, delay).to(item, {
                duration: this.duration - delay,
                x: Math.random() * this.dimensions.width,
                y: Math.random() * this.dimensions.height,
            }, this.duration + delay).to(item, {
                duration: this.duration - delay,
                x: x >= centerX ? this.dimensions.width - 1 : 0,
                y: y,
            }, this.duration * 2 + delay).to(item, {
                duration: this.duration - delay,
                x: x,
                y: Math.sin(x / (this.modulo + 2)) * (this.modulo + 2) + centerY,
            }, this.duration * 3 + delay).to(item, {
                duration: this.duration - delay,
                x: x / 2 + centerX / 2,
                y: this.dimensions.height - (x * 1.5 - centerX) * (x * 1.5 - centerX) / this.dimensions.height,
            }, this.duration * 4 + delay).to(item, {
                duration: this.duration - delay,
                x: Math.sin(x / (this.modulo - 1)) * centerX + centerX,
                y: Math.cos(x / (this.modulo - 1)) * centerY + centerY,
            }, this.duration * 5 + delay).to(item, {
                duration: this.duration - delay,
                x: centerX,
                y: centerY,
            }, this.duration * 6 + delay).to(item, {
                duration: this.duration - delay,
                x: x,
                y: y,
            }, this.duration * 7 + delay);
        }
    },
    killTweens: function () {
        if (!this.timeline) {
            return;
        }

        this.timeline.kill();
    }
}