module.exports = {
    options: null,
    dimensions: null,
    filter: null,
    gfx: null,
    isDirty: false,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        this.container = options.PIXI.instance;
        const PIXI = options.PIXI.module;

        this.filter = new options.PIXI.module.NoiseFilter({
            noise: 0.5,
            seed: Math.random()
        });
        this.filter.noise = options.inputs.noise / 100;

        this.gfx = new PIXI.Graphics();
        this.gfx.filters = [this.filter];
        this.container.addChild(this.gfx);

        this.drawRect();
    },
    uninstall: function () {
        this.gfx.destroy();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.drawRect();

        this.isDirty = true;
    },
    input: function (id, data) {
        switch (id) {
            case "noise":
                this.filter.noise = data / 100;
                break;
        }

        this.isDirty = true;
    },
    render: function () {
        if (this.isDirty) {
            this.filter.seed = Math.random();
            this.isDirty = false;
        }
    },
    blend: function (mode) {
        this.filter.blendMode = mode;
    },

    drawRect: function () {
        this.gfx.clear();
        this.gfx.beginFill(0x000000);
        this.gfx.drawRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.gfx.endFill();
    }
}
