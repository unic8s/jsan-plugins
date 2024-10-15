module.exports = {
    options: null,
    dimensions: null,
    color: null,
    randomColor: false,
    duration: 0.5,
    container: null,
    gfx: null,
    isDirty: false,
    tween: null,

    install: function (options, inputs) {
        this.options = options;

        this.color = inputs.color;

        this.dimensions = this.options.params.canvas;

        this.container = options.PIXI.instance;
        const PIXI = options.PIXI.module;

        this.gfx = new PIXI.Graphics();
        this.container.addChild(this.gfx);

        this.container.alpha = 0;

        this.drawRect();
    },
    uninstall: function() {
        this.gfx.destroy();

        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.isDirty = true;
    },
    blend: function(mode) {
        this.gfx.blendMode = mode;
    },
    input: function (id, data) {
        switch (id) {
            case "trigger":
                this.animate();
                break;
            case "color":
                this.color = data;
                break;
            case "randomColor":
                this.randomColor = data;
                break;
            case "duration":
                this.duration = data;
                break;
        }

        this.isDirty = true;
    },
    render: function () {
        if (this.isDirty) {
            this.drawRect();

            this.isDirty = false;
        }
    },

    drawRect: function () {
        this.gfx.clear();

        let color = this.randomColor ? Math.round(Math.random() * 0xFFFFFF) : this.color;

        this.gfx.beginFill(color);
        this.gfx.drawRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.gfx.endFill();
    },
    animate: function () {
        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }

        this.tween = this.options.GSAP.TweenLite.fromTo(this.container, this.duration,
            {
                alpha: 1
            },
            {
                alpha: 0,
                ease: this.options.GSAP.Linear.easeNone
            }
        );
    }
}