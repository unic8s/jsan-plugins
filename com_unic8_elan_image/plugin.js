module.exports = {
    options: null,
    dimensions: null,
    contains: null,
    image: null,
    loaded: false,
    canvas: null,
    context: null,
    container: null,
    request: null,
    stage: null,
    fade: 0,
    tween: null,
    thumbLimit: 64,
    gif: null,

    install: function (options) {
        this.options = options;

        const refThis = this;

        this.dimensions = this.options.params.canvas;
        this.dimensions.x = 0;
        this.dimensions.y = 0;

        this.image = new Image();
        this.image.onload = function () {
            refThis.loaded = true;

            refThis.scaleImage();

            refThis.killTween();

            refThis.tween = window.TweenLite.to(refThis.stage, refThis.fade, {
                alpha: 1
            });
        }

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.context = this.canvas.getContext("2d", {
            alpha: true,
            willReadFrequently: true
        });

        const PIXI = options.PIXI.module;

        this.container = options.PIXI.instance;

        this.stage = new PIXI.Sprite();
        this.stage.texture = PIXI.Texture.from(this.canvas);
        this.container.addChild(this.stage);

        this.contains = options.nodes.inputs.query("contains").data;
        this.fade = options.nodes.inputs.query("fade").data;

        this.gifData = {
            frames: [],
            index: 0,
            imageData: null
        };
    },
    uninstall: function () {
        this.stage.destroy();

        this.image = null;

        this.killTween();

        clearTimeout(this.timeoutID);
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.scaleImage();
    },
    input: function (id, data) {
        switch (id) {
            case "path":
                clearTimeout(this.timeoutID);

                if (this.tween) {
                    this.tween.kill();
                }

                this.tween = window.TweenLite.to(this.stage, this.fade, {
                    alpha: 0,
                    onComplete: () => {
                        this.killTween();

                        this.loadImage(data);
                    }
                });
                break;
            case "contains":
                this.contains = data;

                this.scaleImage();
                break;
            case "fade":
                this.fade = data > 0 ? data : 0;
                break;
        }
    },
    blend: function (mode) {
        this.stage.blendMode = mode;
    },

    killTween: function () {
        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }
    },
    async loadImage(url) {
        if (this.gif) {
            this.container.removeChild(this.gif);
            this.gif.destroy();
            this.gif = null;
        }

        try {
            const response = await fetch(url);
            const blobData = await response.blob();
            const buffer = await blobData.arrayBuffer();

            switch (blobData.type) {
                case "image/gif":
                    this.gif = await this.options.PIXI.gif.fromBuffer(buffer);

                    this.scaleImage();

                    this.container.addChild(this.gif);
                    break;
                case "image/png":
                case "image/jpeg":
                    this.image.src = this.image.constructor.name == "HTMLImageElement" ? URL.createObjectURL(new Blob([buffer], { type: blobData.type })) : url;
                    break;
            }
        } catch (ex) { }
    },
    prescale: function (width, height) {
        var ratio = 1;

        if (this.contains) {
            ratio = Math.min(this.dimensions.width / width, this.dimensions.height / height);
        } else {
            ratio = Math.max(this.dimensions.width / width, this.dimensions.height / height);
        }

        let realBounds = {
            width: width * ratio,
            height: height * ratio
        };

        let target = this.gif ? this.gif : this.stage;

        target.width = realBounds.width;
        target.height = realBounds.height;
        target.x = (this.dimensions.width - realBounds.width) >> 1;
        target.y = (this.dimensions.height - realBounds.height) >> 1;

        return realBounds;
    },
    scaleImage: function () {
        if (this.gif) {
            this.prescale(this.gif.width, this.gif.height);

            this.options.nodes.outputs.query("average").data = 0;
            this.options.nodes.outputs.query("accent").data = 0;
        } else {
            this.stage.texture.update();

            this.prescale(this.image.width, this.image.height);

            if (this.loaded) {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

                let pixels;

                if (this.dimensions.width > this.thumbLimit || this.dimensions.height > this.thumbLimit) {
                    let thumbCanvas = document.createElement("canvas");
                    thumbCanvas.width = this.dimensions.width > this.thumbLimit ? this.thumbLimit : this.dimensions.width;
                    thumbCanvas.height = this.dimensions.height > this.thumbLimit ? this.thumbLimit : this.dimensions.height;

                    let thumbContext = thumbCanvas.getContext("2d", {
                        alpha: true
                    });

                    thumbContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, thumbCanvas.width, thumbCanvas.height);

                    pixels = thumbContext.getImageData(0, 0, thumbCanvas.width, thumbCanvas.height).data;

                    thumbContext = null;
                    thumbCanvas = null;
                } else {
                    pixels = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
                }

                const average = this.options.helpers.color.calculateAverage(pixels);
                const accent = this.options.helpers.color.calculateAccent(pixels);

                this.options.nodes.outputs.query("average").data = this.options.helpers.color.rgbToHex.apply(this, average);
                this.options.nodes.outputs.query("accent").data = this.options.helpers.color.rgbToHex.apply(this, accent);
            }
        }
    }
}