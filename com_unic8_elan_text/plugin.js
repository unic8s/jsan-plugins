module.exports = {
    options: null,
    dimensions: null,
    tween: null,
    isDirty: false,
    animated: false,
    scroll: null,
    speed: null,
    smooth: null,
    vertical: false,
    label: null,
    style: null,
    container: null,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        const PIXI = options.PIXI.module;
        this.container = options.PIXI.instance;

        const inputs = options.inputs;

        this.style = new PIXI.TextStyle();
        this.style.fill = this.convertColor(inputs.color);
        this.style.fontSize = inputs.size;
        this.style.fontFamily = inputs.font;

        let wordWrapWidth = inputs.width;

        if (wordWrapWidth < 0) {
            wordWrapWidth = 0;
        }

        this.style.wordWrapWidth = wordWrapWidth;
        this.style.wordWrap = this.style.wordWrapWidth > 0;

        this.label = new PIXI.Text("", this.style);
        this.label.text = inputs.label;

        this.scroll = inputs.scroll;
        this.speed = inputs.speed;
        this.smooth = inputs.smooth;

        this.container.addChild(this.label);
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.isDirty = true;
    },
    render: function () {
        if (this.isDirty) {
            this.recalculate();

            this.isDirty = false;
        }
    },
    input: function (id, data) {
        switch (id) {
            case "label":
                this.label.text = data;
                break;
            case "size":
                this.style.fontSize = data;
                break;
            case "font":
                this.style.fontFamily = data;
                break;
            case "color":
                this.style.fill = data;
                return;
            case "width":
                this.style.wordWrapWidth = data < 0 ? 0 : data;
                this.style.wordWrap = this.style.wordWrapWidth > 0;
                break;
            case "scroll":
                this.scroll = data;
                break;
            case "speed":
                this.speed = data;
                break;
            case "smooth":
                this.smooth = data;
                break;
            case "vertical":
                this.vertical = data;
                break;
        }

        this.isDirty = true;
    },
    blend: function (mode) {
        this.label.blendMode = mode;
    },
    uninstall: function () {
        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }
    },

    convertColor: function (hex) {
        const result = parseInt(hex.replace("#", "0x"), 16);

        return isNaN(result) ? 0 : result;
    },
    recalculate: function () {
        this.animated = false;

        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }

        this.label.x = 0;
        this.label.y = 0;

        if (this.scroll && (this.label.width > this.dimensions.width || this.label.height > this.dimensions.height)) {
            this.animated = true;

            this.animateLabel(this.dimensions.width, this.dimensions.height);
        }

        this.calcMetrics();
    },
    calcMetrics: function () {
        this.options.outputs.metrics = {
            x: this.label.x,
            y: this.label.y,
            width: this.label.width,
            height: this.label.height
        }
    },
    animateLabel: function (width, height) {
        if (!this.animated) {
            return;
        }

        const refThis = this;

        if (!this.vertical) {
            const diff = width + this.label.width;

            this.tween = this.options.GSAP.TweenLite.fromTo(this.label, Math.abs(diff / this.speed),
                {
                    x: width
                },
                {
                    x: -this.label.width,
                    ease: this.options.GSAP.Linear.easeNone,
                    onComplete: (width, height) => {
                        refThis.animateLabel(width, height);
                    },
                    onCompleteParams: [width, height],
                    roundProps: {
                        x: this.smooth ? 0.01 : 1
                    }
                }
            );
        } else {
            const diff = height + this.label.height;

            this.tween = this.options.GSAP.TweenLite.fromTo(this.label, Math.abs(diff / this.speed),
                {
                    y: height
                },
                {
                    y: -this.label.height,
                    ease: this.options.GSAP.Linear.easeNone,
                    onComplete: (width, height) => {
                        refThis.animateLabel(width, height);
                    },
                    onCompleteParams: [width, height],
                    roundProps: {
                        y: this.smooth ? 0.01 : 1
                    }
                }
            );
        }
    }
}
