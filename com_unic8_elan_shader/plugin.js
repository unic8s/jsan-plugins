module.exports = {
    options: null,
    dimensions: null,
    container: null,
    filter: null,
    gfx: null,
    timestamp: Date.now(),
    shaderList: [
        "assets/cave.frag",
        "assets/cells.frag",
        "assets/chase.frag",
        "assets/geom.frag",
        "assets/liquid.frag",
        "assets/organic.frag",
        "assets/pattern.frag",
        "assets/plasma.frag",
        "assets/rain.frag",
        "assets/robot.frag",
        "assets/skyline.frag",
        "assets/spheres.frag",
        "assets/tunnel_clouds.frag",
        "assets/tunnel_fire.frag",
        "assets/tunnel.frag"
    ],
    shaderIndex: 0,
    timeScale: 1,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        this.container = options.PIXI.instance;

        const PIXI = this.options.PIXI.module;

        this.gfx = new PIXI.Graphics();
        this.container.addChild(this.gfx);

        this.drawFrame();
        this.init();
    },
    uninstall: function () {
        this.gfx.destroy();
    },
    render: function () {
        if (this.filter) {
            const now = Date.now();
            const delta = now - this.timestamp;

            this.filter.fields.uTime.value += delta * 0.001 * this.timeScale;
            this.timestamp = now;
        }
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.drawFrame();

        if (this.filter) {
            this.filter.fields.width.value = this.dimensions.width;
            this.filter.fields.height.value = this.dimensions.height;
        }
    },
    blend: function (mode) {
        if (this.filter) {
            this.filter.blendMode = mode;
        }
    },
    input: function (id, data) {
        switch (id) {
            case "red":
            case "green":
            case "blue":
                this.filter.fields[id].value = data ? 4.0 : 1.0
                break;
            case "opacity":
                this.filter.fields.alpha.value = data
                break;
            case "index":
                this.shaderIndex = data;

                if (this.shaderIndex < 0) {
                    this.shaderIndex = 0;
                } else if (this.shaderIndex > this.shaderList.length - 1) {
                    this.shaderIndex = this.shaderList.length - 1;
                }

                this.init();
                break;
            case "timeScale":
                this.timeScale = data;
                break;
        }
    },

    init: async function () {
        const PIXI = this.options.PIXI.module;

        const filePath = this.shaderList[this.shaderIndex];

        const fileID = this.options.files[filePath];

        try {
            const response = await fetch(fileID);
            const fragment = await response.text();

            this.filter = new PIXI.Filter({
                glProgram: PIXI.GlProgram.from({
                    fragment: fragment,
                    vertex: null
                }),
                resources: {
                    time: { value: 0.0, type: 'f32' },
                    width: { value: this.dimensions.width, type: 'uint8' },
                    height: { value: this.dimensions.height, type: 'uint8' },
                    red: { value: 0.0, type: 'f32' },
                    green: { value: 0.0, type: 'f32' },
                    blue: { value: 0.0, type: 'f32' },
                    alpha: { value: 0.0, type: 'f32' }
                }
            });

            this.filter.blendMode = this.container.blendMode;

            this.container.filters = [this.filter];
        } catch (ex) { }
    },
    drawFrame() {
        this.gfx.clear();
        this.gfx.rect(0, 0, this.dimensions.width, this.dimensions.height);
        this.gfx.fill(0x000000);
    }
}