module.exports = {
    dimensions: null,
    container: null,
    contains: null,
    options: null,
    PIXI: null,
    camData: null,
    stage: null,

    install: function (options, inputs) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        this.contains = inputs.contains;

        this.container = options.PIXI.instance;
        this.PIXI = options.PIXI.module;

        this.stage = new this.PIXI.Sprite();
        this.container.addChild(this.stage);
    },
    uninstall: function() {
        this.stage.destroy();
    },
    input: function (id, data) {
        switch (id) {
            case "contains":
                this.contains = data;

                this.scaleCamera();
                break;
        }
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.scaleCamera();
    },
    blend: function(mode) {
        this.stage.blendMode = mode;
    },
    cameraUpdate: function (event) {
        this.camData = event.data;
    },
    cameraActive: function () {
        this.container.visible = true;
    },
    cameraInactive: function () {
        this.container.visible = false;
    },
    render() {
        if(!this.camData){
            return;
        }

        if(!this.stage.texture || !this.stage.texture.baseTexture.resource){
            this.stage.texture = this.PIXI.Texture.fromBuffer(this.camData, this.options.params.canvas.width, this.options.params.canvas.height);
        }else{
            this.stage.texture.baseTexture.resource.data = this.camData;
            this.stage.texture.update();
        }
    },

    scaleCamera: function () {
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
    }
}