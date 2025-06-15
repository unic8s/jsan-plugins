module.exports = {
    options: null,
    dimensions: null,
    colorFrom: null,
    colorTo: null,
    alphaFrom: 0,
    alphaTo: 1,
    container: null,
    gfx: null,
    isDirty: false,
    canvas: null,
    context: null,

    install: function (options) {
        this.options = options;

        this.colorFrom = this.options.helpers.color.hexToRGB(options.inputs.colorFrom);
        this.colorTo = this.options.helpers.color.hexToRGB(options.inputs.colorTo);
        this.alphaFrom = options.inputs.alphaFrom;
        this.alphaTo = options.inputs.alphaTo;

        this.dimensions = this.options.params.canvas;

        this.container = options.PIXI.instance;
        const PIXI = options.PIXI.module;

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.context = this.canvas.getContext("2d", {
            willReadFrequently: true
        });

        this.gfx = new PIXI.Sprite(PIXI.Texture.from(this.canvas));
        this.container.addChild(this.gfx);

        this.drawGradient();
    },
    uninstall: function () {
        this.gfx.destroy();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.drawGradient();
    },
    input: function (id, data) {
        switch (id) {
            case "colorFrom":
                this.colorFrom = this.options.helpers.color.hexToRGB(data);
                break;
            case "colorTo":
                this.colorTo = this.options.helpers.color.hexToRGB(data);
                break;
            case "alphaFrom":
                this.alphaFrom = data;
                break;
            case "alphaTo":
                this.alphaTo = data;
                break;
        }

        this.drawGradient();
    },
    blend: function (mode) {
        this.gfx.blendMode = mode;
    },

    drawGradient: function () {
        this.context.clearRect(0, 0, this.dimensions.width, this.dimensions.height);

        const gradient = this.context.createLinearGradient(0, 0, this.dimensions.width, 0);

        gradient.addColorStop(0, "rgb(" + this.colorFrom.r + "," + this.colorFrom.g + "," + this.colorFrom.b + "," + this.alphaFrom + ")");
        gradient.addColorStop(1, "rgb(" + this.colorTo.r + "," + this.colorTo.g + "," + this.colorTo.b + "," + this.alphaTo + ")");

        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);

        this.gfx.texture.update();
    }
}
