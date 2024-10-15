module.exports = {
    options: null,
    outputs: null,
    dimensions: null,
    contains: null,
    image: null,
    loaded: false,
    canvas: null,
    context: null,
    container: null,
    timeoutID: null,
    gifData: null,
    request: null,
    stage: null,
    fade: 0,
    tween: null,
    thumbLimit: 64,
    isGIF: false,
    frameDelay: -1,
    gifDims: {
        width: 0,
        height: 0
    },
    patchCanvas: null,
    patchContext: null,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;

        const refThis = this;

        this.dimensions = this.options.params.canvas;
        this.dimensions.x = 0;
        this.dimensions.y = 0;

        this.image = new Image();
        this.image.onload = function () {
            refThis.loaded = true;

            refThis.scaleImage();

            refThis.killTween();

            refThis.tween = refThis.options.GSAP.TweenLite.to(refThis.stage, refThis.fade, {
                alpha: 1
            });
        };
        this.image.onerror = function () { };

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

        this.contains = inputs.contains;
        this.fade = inputs.fade;

        this.gifData = {
            frames: [],
            index: 0,
            imageData: null,
            rendered: []
        };

        this.patchCanvas = document.createElement("canvas");
        this.patchContext = this.patchCanvas.getContext("2d", {
            alpha: true,
            willReadFrequently: true
        });
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

                this.tween = this.options.GSAP.TweenLite.to(this.stage, this.fade, {
                    alpha: 0,
                    onComplete: () => {
                        this.killTween();

                        if(data){
                            this.loadImage(data);
                        }
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
            case "frameDelay":
                this.frameDelay = data;
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
        this.loaded = false;

        if (String(url).substring(0, 5) == "data:") {
            this.image.src = url;
        } else {
            try {
                const response = await fetch(url);
                const blobData = await response.blob();
                const buffer = await blobData.arrayBuffer();

                this.isGIF = blobData.type == "image/gif";

                switch (blobData.type) {
                    case "image/gif":
                        var gifuctJS = this.options.GIF;

                        var gifRaw = gifuctJS.parseGIF(buffer);

                        this.validateAndFix(gifRaw);

                        this.gifData.frames = gifuctJS.decompressFrames(gifRaw, true);
                        this.gifData.index = 0;

                        this.precomputeFrames();

                        var currentFrame = this.gifData.frames[0];
                        this.prescale(currentFrame.dims.width, currentFrame.dims.height);

                        this.animateGif();

                        this.killTween();

                        this.tween = this.options.GSAP.TweenLite.to(this.stage, this.fade, {
                            alpha: 1
                        });
                        break;
                    case "image/png":
                    case "image/jpeg":
                    case "image/webp":
                    case "image/svg+xml":
                        this.image.src = this.image.constructor.name == "HTMLImageElement" ? URL.createObjectURL(new Blob([buffer], { type: blobData.type })) : url;
                        break;
                }
            } catch (ex) {
                console.error(ex);
            }
        }
    },
    validateAndFix: function (gif) {
        let currentGce = null;

        for (const frame of gif.frames) {
            currentGce = frame.gce ?? currentGce;

            if ('image' in frame && !('gce' in frame)) {
                frame.gce = currentGce;
            }
        }
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

        this.stage.width = realBounds.width;
        this.stage.height = realBounds.height;
        this.stage.x = (this.dimensions.width - realBounds.width) >> 1;
        this.stage.y = (this.dimensions.height - realBounds.height) >> 1;

        return realBounds;
    },
    scaleImage: function () {
        this.stage.texture.update();

        if (this.loaded && !this.isGIF) {
            this.prescale(this.image.width, this.image.height);

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

            this.outputs.average = this.options.helpers.color.rgbToHex.apply(this, average);
            this.outputs.accent = this.options.helpers.color.rgbToHex.apply(this, accent);
        } else {
            this.prescale(this.gifDims.width, this.gifDims.height);
        }
    },
    precomputeFrames() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let previousFrame = null;
        const fps = 30;
        const defaultDelay = (1000 / fps) | 0;

        this.gifData.rendered = [];

        for (let i = 0; i < this.gifData.frames.length; i++) {
            const {
                disposalType = 2,
                delay = defaultDelay,
                patch,
                dims: { width, height, left, top },
            } = this.gifData.frames[i];

            if (i == 0) {
                this.gifDims.width = width;
                this.gifDims.height = height;
            }

            this.patchCanvas.width = width;
            this.patchCanvas.height = height;
            this.patchContext.clearRect(0, 0, width, height);
            const patchData = this.patchContext.createImageData(width, height);

            patchData.data.set(patch);
            this.patchContext.putImageData(patchData, 0, 0);

            if (disposalType === 3) {
                previousFrame = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            }

            this.context.drawImage(this.patchCanvas, left, top);
            const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

            if (disposalType === 2) {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            else if (disposalType === 3) {
                this.context.putImageData(previousFrame, 0, 0);
            }

            this.gifData.rendered.push({
                delay: delay,
                data: imageData
            });
        }

        this.patchCanvas.width = this.gifDims.width;
        this.patchCanvas.height = this.gifDims.height;
    },
    animateGif: function () {
        let currentFrame = this.gifData.rendered[this.gifData.index];

        this.patchContext.putImageData(currentFrame.data, 0, 0);

        this.context.drawImage(this.patchCanvas, 0, 0, this.canvas.width, this.canvas.height);

        if (this.gifData.index < this.gifData.frames.length - 1) {
            this.gifData.index++;
        } else {
            this.gifData.index = 0;
        }

        this.stage.texture.update();

        if (this.timeoutID != null) {
            clearTimeout(this.timeoutID);
        }

        this.timeoutID = setTimeout(() => {
            clearTimeout(this.timeoutID);

            this.animateGif();
        }, this.frameDelay > -1 ? this.frameDelay : currentFrame.delay);
    }
}