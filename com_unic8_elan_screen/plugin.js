module.exports = {
    options: null,
    dimensions: null,
    contains: null,
    container: null,
    PIXI: null,
    screenData: null,
    stage: null,

    install: function (options, inputs) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        this.contains = inputs.contains;

        this.container = options.PIXI.instance;
        this.PIXI = options.PIXI.module;

        this.stage = new this.PIXI.Sprite();
        this.container.addChild(this.stage);

        //this.scaleScreen();
    },
    uninstall: function() {
        this.stage.destroy();
    },
    input: function (id, data) {
        switch (id) {
            case "contains":
                this.contains = data;

                this.scaleScreen();
                break;
        }
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.scaleScreen();
    },
    blend: function(mode) {
        this.stage.blendMode = mode;
    },
    screenUpdate: function (event) {
        this.screenData = event.data;
    },
    screenActive: function () {
        this.container.visible = true;
    },
    screenInactive: function () {
        this.container.visible = false;
    },
    render() {
        if (!this.screenData) {
            return;
        }

        if (!this.stage.texture || !this.stage.texture.baseTexture.resource) {
            this.stage.texture = this.PIXI.Texture.fromBuffer(this.screenData, this.options.params.canvas.width, this.options.params.canvas.height);
        } else {
            this.stage.texture.baseTexture.resource.data = this.screenData;
            this.stage.texture.update();
        }
    },

    scaleScreen: function () {
        this.stage.texture.destroy(true);
        this.stage.texture = null;

        var ratio = 1;

        if (this.contains) {
            ratio = Math.min(this.dimensions.width / this.options.params.canvas.width, this.dimensions.height / this.options.params.canvas.height);
        } else {
            ratio = Math.max(this.dimensions.width / this.options.params.canvas.width, this.dimensions.height / this.options.params.canvas.height);
        }

        let realBounds = {
            width: this.options.params.canvas.width * ratio,
            height: this.options.params.canvas.height * ratio
        };

        this.stage.width = realBounds.width;
        this.stage.height = realBounds.height;
        this.stage.x = this.dimensions.x + ((this.dimensions.width - realBounds.width) >> 1);
        this.stage.y = this.dimensions.y + ((this.dimensions.height - realBounds.height) >> 1);
    }
}