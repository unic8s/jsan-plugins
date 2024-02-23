module.exports = {
    options: null,
    dimensions: null,
    color: null,
    radius: 0,
    chamfer: false,
    container: null,
    gfx: null,
    isDirty: false,

    install: function (options) {
        this.options = options;

        this.color = options.nodes.inputs.query("color").data;
        this.radius = options.nodes.inputs.query("radius").data;
        this.chamfer = options.nodes.inputs.query("chamfer").data;

        this.dimensions = this.options.params.canvas;

        this.container = options.PIXI.instance;
        const PIXI = options.PIXI.module;

        this.gfx = new PIXI.Graphics();
        this.container.addChild(this.gfx);

        this.drawRect();
    },
    uninstall: function () {
        this.gfx.destroy();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.isDirty = true;
    },
    input: function (id, data) {
        switch (id) {
            case "color":
                this.color = data;
                break;
            case "radius":
                this.radius = data;
                break;
            case "chamfer":
                this.chamfer = data;
                break;
        }

        this.isDirty = true;
    },
    render: function () {
        if (this.isDirty) {
            this.drawRect();

            this.isDirty = false;
        }
    },
    blend: function (mode) {
        this.gfx.blendMode = mode;
    },

    drawRect: function () {
        this.gfx.clear();
        this.gfx.beginFill(this.color);

        if(this.chamfer){
            this.gfx.drawChamferRect(0, 0, this.dimensions.width, this.dimensions.height, this.radius);
        }else{
            this.gfx.drawFilletRect(0, 0, this.dimensions.width, this.dimensions.height, this.radius);
        }
        this.gfx.endFill();
    }
}