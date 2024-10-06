module.exports = {
    options: null,
    dimensions: null,
    container: null,
    vinyl: null,
    mask: null,
    hole: null,
    playhead: null,
    playheadSize: 0,
    cover: null,
    playheadMin: -0.563,
    playheadMax: -0.078,
    progress: 0,
    ready: false,
    playing: false,

    install: function (options) {
        this.options = options;
        this.dimensions = this.options.params.canvas;
        this.container = this.options.PIXI.instance;

        this.build();
    },
    input: function (id, data) {
        switch (id) {
            case "cover":
                this.cover.texture = this.options.PIXI.module.Texture.from(data);

                this.scaleAndPosition();
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

        this.update();
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

        this.mask = new PIXI.Graphics();
        this.cover = new PIXI.Sprite();
        this.cover.mask = this.mask;       

        this.hole = new PIXI.Graphics();

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
        this.container.addChild(this.cover);
        this.container.addChild(this.mask);
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

        setTimeout(() => {
            this.cover.scale.set(1, 1);
            this.cover.pivot.set(this.cover.width >> 1, this.cover.height >> 1);
            this.cover.scale.set(scale * 1.05, scale * 1.05);
        }, 50);

        this.mask.clear();
        this.mask.beginFill("#FF0000");
        this.mask.drawCircle(this.vinyl.width >> 1, this.vinyl.height >> 1, 160 * scale);
        this.mask.endFill();

        this.hole.clear();
        this.hole.beginFill("#000000");
        this.hole.drawCircle(this.vinyl.width >> 1, this.vinyl.height >> 1, 11 * scale);
        this.hole.endFill();
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
            this.cover.rotation += 0.005;
        } else {
            this.cover.rotation = 0;
        }
    }
}