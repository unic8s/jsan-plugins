module.exports = {
    options: null,
    dimensions: null,
    track: null,
    fill: null,
    minimum: null,
    maximum: null,
    value: null,
    container: null,
    isDirty: false,
    gfx: null,

    install: function (options) {
        this.options = options;

        this.track = options.nodes.inputs.query("track").data;
        this.fill = options.nodes.inputs.query("fill").data;
        this.minimum = options.nodes.inputs.query("minimum").data;
        this.maximum = options.nodes.inputs.query("maximum").data;
        this.value = options.nodes.inputs.query("value").data;

        this.dimensions = this.options.params.canvas;

        this.container = options.PIXI.instance;
        const PIXI = options.PIXI.module;

        this.gfx = new PIXI.Graphics();
        this.container.addChild(this.gfx);

        this.drawRect();
    },
    uninstall: function() {
        this.gfx.destroy();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.isDirty = true;
    },
    render: function () {
        if (this.isDirty) {
            this.drawRect();

            this.isDirty = false;
        }
    },
    blend: function(mode) {
        this.gfx.blendMode = mode;
    },
    input: function (id, data) {
        switch (id) {
            case "track":
                this.track = data;
                break;
            case "fill":
                this.fill = data;
                break;
            case "minimum":
                this.minimum = data;
                break;
            case "maximum":
                this.maximum = data;
                break;
            case "value":
                this.value = data <= this.maximum ? data : this.maximum;
                break;
        }

        this.isDirty = true;
    },

    drawRect: function () {
        const progress = this.dimensions.width / (this.maximum - this.minimum) * (this.value - this.minimum);

        this.gfx.clear();

        this.gfx.beginFill(this.track);
        this.gfx.drawRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.gfx.endFill();

        this.gfx.beginFill(this.fill);
        this.gfx.drawRect(0, 0, progress, this.dimensions.height);
        this.gfx.endFill();
    }
}