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
    uninstall: function() {
        this.gfx.destroy();
    },
    render: function () {
        if (this.filter) {
            const now = Date.now();
            const delta = now - this.timestamp;

            this.filter.uniforms.time += delta * 0.001 * this.timeScale;
            this.timestamp = now;
        }
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.drawFrame();

        if (this.filter) {
            this.filter.uniforms.width = this.dimensions.width;
            this.filter.uniforms.height = this.dimensions.height;
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
                this.filter.uniforms[id] = data ? 4.0 : 1.0
                break;
            case "alpha":
                this.filter.uniforms.alpha = data
                break;
            case "index":
                this.shaderIndex = data;

                if(this.shaderIndex < 0){
                    this.shaderIndex = 0;
                }else if(this.shaderIndex > this.shaderList.length - 1){
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

            this.filter = new PIXI.Filter(
                // vertex shader
                null,
                // fragment shader
                fragment,
                // custom uniforms
                {
                    time: 0.0,
                    width: this.dimensions.width,
                    height: this.dimensions.height,
                    red: 1.0,
                    green: 1.0,
                    blue: 1.0,
                    alpha: 0.0
                }
            );

            this.filter.blendMode = this.container.blendMode;

            this.container.filters = [this.filter];
        } catch (ex) { }
    },
    drawFrame() {
        this.gfx.clear();
        this.gfx.beginFill(0x000000);
        this.gfx.drawRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.gfx.endFill();
    }
}