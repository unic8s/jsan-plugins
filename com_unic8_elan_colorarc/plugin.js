module.exports = {
    options: null,
    dimensions: null,
    color: null,
    size: 10,
    radius: 10,
    start: 0,
    end: 270,
    invert: false,
    container: null,
    gfx: null,
    isDirty: false,

    install: function (options) {
        this.options = options;

        this.color = options.inputs.color;
        this.size = options.inputs.size;
        this.radius = options.inputs.radius;
        this.start = options.inputs.start;
        this.end = options.inputs.end;
        this.invert = options.inputs.invert;

        this.dimensions = this.options.params.canvas;

        this.container = options.PIXI.instance;
        const PIXI = options.PIXI.module;

        this.gfx = new PIXI.Graphics();
        this.container.addChild(this.gfx);

        this.drawArc();
    },
    uninstall: function () {
        this.gfx.destroy();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.isDirty = true;
    },
    input: function (id, data) {
        switch (id) {
            case "color":
                this.color = data;
                break;
            case "size":
                this.size = data;
                break;
            case "radius":
                this.radius = data;
                break;
            case "start":
                this.start = data;
                break;
            case "end":
                this.end = data;
                break;
            case "invert":
                this.invert = data;
                break;
        }

        this.isDirty = true;
    },
    render: function () {
        if (this.isDirty) {
            this.drawArc();

            this.isDirty = false;
        }
    },
    blend: function (mode) {
        this.gfx.blendMode = mode;
    },

    drawArc: function () {
        this.gfx.clear();
        this.gfx.lineStyle(this.size, this.color, 1, true);

        const deg2rad = Math.PI / 180;
        const offset = 90;

        this.gfx.arc(this.dimensions.width >> 1, this.dimensions.height >> 1, this.radius, (this.start - offset) * deg2rad, (this.end - offset) * deg2rad, this.invert);
    }
}
