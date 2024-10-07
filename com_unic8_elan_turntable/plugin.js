module.exports = {
    options: null,
    dimensions: null,
    container: null,
    vinyl: null,
    hole: null,
    grain: null,
    grainMask: null,
    playhead: null,
    playheadSize: 0,
    cover: null,
    coverMask: null,
    playheadMin: -0.563,
    playheadMax: -0.078,
    progress: 0,
    ready: false,
    playing: false,
    speed: 0.005,

    install: function (options) {
        this.options = options;
        this.dimensions = this.options.params.canvas;
        this.container = this.options.PIXI.instance;

        this.build();
    },
    input: function (id, data) {
        const refThis = this;

        switch (id) {
            case "cover":
                var texture = this.options.PIXI.module.Texture.from(data);
                
                texture.on("update", () => {
                    this.cover.texture = texture;

                    refThis.scaleAndPosition();
                });
                break;
            case "progress":
                this.progress = data;

                if (this.progress > 1) {
                    this.progress = 1;
                } else if (this.progress < 0) {
                    this.progress = 0;
                }
                break;
            case "playing":
                this.playing = data;
                break;
        }
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.scaleAndPosition();
    },
    render: function () {
        this.update();
    },

    build: async function () {
        const PIXI = this.options.PIXI.module;

        this.coverMask = new PIXI.Graphics();
        this.cover = new PIXI.Sprite();
        this.cover.mask = this.coverMask;

        this.hole = new PIXI.Graphics();

        this.grain = new PIXI.Graphics();
        this.grainMask = new PIXI.Graphics();
        this.grain.mask = this.grainMask;

        const vinylTexture = await PIXI.Assets.load({
            src: this.options.files["assets/vinyl.png"],
            loadParser: 'loadTextures'
        });
        this.vinyl = new PIXI.Sprite(vinylTexture);

        const playheadTexture = await PIXI.Assets.load({
            src: this.options.files["assets/playhead.png"],
            loadParser: 'loadTextures'
        });
        window.playhead = this.playhead = new PIXI.Sprite(playheadTexture);
        this.playheadSize = this.playhead.height;
        this.playhead.pivot.set(353, 58);

        this.container.addChild(this.vinyl);
        this.container.addChild(this.grain);
        this.container.addChild(this.grainMask);
        this.container.addChild(this.cover);
        this.container.addChild(this.coverMask);
        this.container.addChild(this.hole);
        this.container.addChild(this.playhead);

        this.ready = true;

        this.scaleAndPosition();
    },
    scaleAndPosition: function () {
        if (!this.ready) {
            return;
        }

        const minSize = Math.min(this.dimensions.width, this.dimensions.height);

        this.vinyl.width = this.vinyl.height = minSize;

        const scale = this.dimensions.height * 0.57 / this.playheadSize;
        const offset = 70 * scale;

        this.playhead.position.set(this.vinyl.width - offset, offset);
        this.playhead.scale.set(scale, scale);

        this.cover.position.set(this.vinyl.width >> 1, this.vinyl.height >> 1);

        const coverScale = 256 / this.cover.texture.width * scale * 1.25;

        this.cover.pivot.set(this.cover.texture.width >> 1, this.cover.texture.height >> 1);
        this.cover.scale.set(coverScale, coverScale);

        this.coverMask.clear();
        this.coverMask.beginFill("#FF0000");
        this.coverMask.drawCircle(this.vinyl.width >> 1, this.vinyl.height >> 1, 160 * scale);
        this.coverMask.endFill();

        this.hole.clear();
        this.hole.beginFill("#000000");
        this.hole.drawCircle(this.vinyl.width >> 1, this.vinyl.height >> 1, 11 * scale);
        this.hole.endFill();

        this.grainMask.clear();
        this.grainMask.beginFill("#FF0000");
        this.grainMask.drawCircle(this.vinyl.width >> 1, this.vinyl.height >> 1, minSize >> 1);
        this.grainMask.endFill();

        this.grain.position.set(this.vinyl.width >> 1, this.vinyl.height >> 1);
        this.grain.pivot.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.grain.clear();
        this.grain.beginFill("#000000", Math.random() * 0.25 + 0.25);

        for (let y = 0; y < this.dimensions.height; y++) {
            for (let x = 0; x < this.dimensions.width; x++) {
                if (Math.round(Math.random() * 0.52) == 1) {
                    this.grain.drawRect(x, y, 1, 1);
                }
            }
        }

        this.grain.endFill();
    },
    update: function () {
        if (!this.ready) {
            return;
        }

        this.options.GSAP.TweenLite.to(this.playhead, 1,
            {
                rotation: this.playheadMin + (this.playheadMax - this.playheadMin) * this.progress
            }
        );

        if (this.playing) {
            this.cover.rotation += this.speed;
            this.grain.rotation += this.speed;
        } else {
            this.cover.rotation = 0;
        }
    }
}