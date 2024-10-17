module.exports = {
    options: null,
    dimensions: null,
    contains: null,
    PIXI: null,
    container: null,
    player: null,
    stage: null,
    speed: 1,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;
        this.dimensions.x = 0;
        this.dimensions.y = 0;

        this.player = document.createElement("video");
        this.player.crossOrigin = "anonymous";

        const inputs = options.inputs;

        this.player.loop = inputs.loop;
        this.player.autoplay = inputs.autoplay;
        this.player.muted = inputs.muted;
        this.player.src = inputs.path;
        this.contains = inputs.contains;
        this.speed = inputs.speed;

        this.container = options.PIXI.instance;
        this.PIXI = options.PIXI.module;

        this.stage = new this.PIXI.Sprite();
        this.container.addChild(this.stage);

        const refThis = this;
        const outputs = options.outputs;

        this.player.onloadedmetadata = function () {
            outputs.duration = refThis.player.duration;

            refThis.player.playbackRate = refThis.speed;

            refThis.stage.texture = refThis.PIXI.Texture.from(refThis.player);

            refThis.scaleVideo();
        }

        this.player.ontimeupdate = function () {
            if (!refThis.player) {
                return;
            }

            refThis.scaleVideo();

            outputs.progress = refThis.player.currentTime;
        }

        this.player.onplay = function () {
            outputs.paused = false;
        }

        this.player.onpause = function () {
            outputs.paused = true;
        }

        this.player.onstream = function (data) {
            if (refThis.stage.texture && refThis.stage.texture.baseTexture && refThis.stage.texture.baseTexture.resource) {
                refThis.stage.texture.baseTexture.resource.data.set(data);
                refThis.stage.texture.update();
            } else {
                refThis.player = {
                    videoWidth: refThis.dimensions.width,
                    videoHeight: refThis.dimensions.height
                };

                const resource = new refThis.PIXI.BufferResource(data, {
                    width: refThis.dimensions.width,
                    height: refThis.dimensions.height
                });

                refThis.stage.texture = refThis.PIXI.Texture.from(resource);

                refThis.scaleVideo();
            }
        }

        this.player.onended = function () {
            outputs.ended = !outputs.ended;
        };
    },
    uninstall: function () {
        this.stage.destroy();

        this.player.src = "";

        delete this.player;
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.scaleVideo();
    },
    blend: function (mode) {
        this.stage.blendMode = mode;
    },
    input: function (id, data) {
        switch (id) {
            case "path":
                this.stage.texture.destroy(true);
                this.stage.texture = null;

                this.player.src = data;
                break;
            case "contains":
                this.contains = data;

                this.scaleVideo();
                break;
            case "autoplay":
                this.player.autoplay = data;
                break;
            case "loop":
                this.player.loop = data;
                break;
            case "muted":
                this.player.muted = data;
                break;
            case "progress":
                this.player.currentTime = data;
                break;
            case "speed":
                this.player.playbackRate = this.speed = data;
                break;
            case "paused":
                if (data) {
                    this.player.pause();
                } else {
                    this.player.play();
                }
                break;
        }
    },

    scaleVideo: function () {
        var ratio = 1;

        if (this.contains) {
            ratio = Math.min(this.dimensions.width / this.player.videoWidth, this.dimensions.height / this.player.videoHeight);
        } else {
            ratio = Math.max(this.dimensions.width / this.player.videoWidth, this.dimensions.height / this.player.videoHeight);
        }

        if (!isFinite(ratio)) {
            ratio = 1;
        }

        let realBounds = {
            width: this.player.videoWidth * ratio,
            height: this.player.videoHeight * ratio
        };

        this.stage.width = realBounds.width;
        this.stage.height = realBounds.height;
        this.stage.x = (this.dimensions.width - realBounds.width) >> 1;
        this.stage.y = (this.dimensions.height - realBounds.height) >> 1;
    }
}
