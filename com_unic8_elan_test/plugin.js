module.exports = {
    options: null,
    dimensions: null,
    container: null,
    testGfx: null,
    tween: null,
    speed: null,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        const PIXI = options.PIXI.module;
        this.container = options.PIXI.instance;

        this.testGfx = new PIXI.Graphics();
        this.container.addChild(this.testGfx);

        this.speed = options.nodes.inputs.query("speed").data;

        this.draw();
        this.animate();
    },
    uninstall: function() {
        this.testGfx.destroy();

        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }
    },
    blend: function(mode) {
        this.testGfx.blendMode = mode;
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.draw();
    },
    input: function (id, data) {
        switch (id) {
            case "speed":
                this.speed = data;
                break;
        }

        this.animate();
    },

    animate: function () {
        this.testGfx.rotation = 0;

        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }

        const refThis = this;

        this.tween = window.TweenLite.to(this.testGfx, this.speed,
            {
                rotation: 2 * Math.PI,
                ease: window.Linear.easeNone,
                onComplete: () => {
                    refThis.animate();
                }
            }
        );
    },
    draw: function () {
        this.testGfx.clear();

        this.testGfx.position.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.testGfx.pivot.set(this.dimensions.width >> 1, this.dimensions.height >> 1);

        const palette = [
            0xFF0000,
            0xFF9900,
            0xFFFF00,
            0x99FF00,
            0x00FF00,
            0x00FF99,
            0x00FFFF,
            0x0099FF,
            0x0000FF,
            0x9900FF,
            0xFF00FF
        ]

        const step = (this.dimensions.width - 20) / 11;

        for (let c = 0; c < palette.length; c++) {
            const color = palette[c];

            this.testGfx.beginFill(color);
            this.testGfx.drawRect(10 + c * step, 10, step, this.dimensions.height - 20);
        }
    }
}