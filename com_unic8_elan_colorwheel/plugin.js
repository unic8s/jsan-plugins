module.exports = {
    options: null,
    dimensions: null,
    container: null,
    gfx: null,
    offset: 0,
    steps: 25,
    palette: [],

    install: function (options) {
        this.options = options;

        const PIXI = this.options.PIXI.module;
        this.container = this.options.PIXI.instance;

        this.dimensions = this.options.params.canvas;

        this.steps = options.nodes.inputs.query("steps").data;

        this.gfx = new PIXI.Graphics();

        this.container.addChild(this.gfx);

        this.buildPalette();
        this.draw();
    },
    uninstall: function() {
        this.gfx.destroy();
    },
    input: function (id, data) {
        switch (id) {
            case "steps":
                this.steps = data > 0 ? data : 1;

                this.buildPalette();
                break;
        }

        this.draw();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.buildPalette();
        this.draw();
    },
    render: function () {
        if(this.offset < this.palette.length - 1){
            this.offset++;
        }else{
            this.offset = 0;
        }

        this.draw();
    },
    blend: function(mode) {
        this.gfx.blendMode = mode;
    },

    draw: function () {
        this.gfx.clear();

        for (let c = 0; c < this.palette.length && c < this.dimensions.width; c++) {
            let index = this.offset + c;

            if (index >= this.palette.length) {
                index -= this.palette.length;
            }

            const color = this.palette[index];

            this.gfx.beginFill(color);
            this.gfx.drawRect(c, this.dimensions.y, 1, this.dimensions.height);
            this.gfx.endFill();
        }
    },

    buildPalette(){
        this.palette = [];

        let index = 0;
        const rules = [
            [0, 1, 0],
            [-1, 0, 0],
            [0, 0, 1],
            [0, -1, 0],
            [1, 0, 0],
            [0, 0, -1],
        ]
        //const step = (rules.length * 256) / this.dimensions.width;
        const color = [255, 0, 0];

        const PIXI = this.options.PIXI.module;

        let limit = rules.length * (256 / this.steps);

        while(limit < this.dimensions.width){
            limit *= 2;
        }

        for (let c1 = 0; c1 < limit; c1++) {
            this.palette.push(new PIXI.Color({ r: color[0] | 0, g: color[1] | 0, b: color[2] | 0, a: 1 }));

            const rule = rules[index];

            for (let c2 = 0; c2 < color.length; c2++) {
                const direction = rule[c2];

                color[c2] += direction * this.steps;

                if (
                    (direction == 1 && color[c2] >= 255)
                    ||
                    (direction == -1 && color[c2] <= 0)
                ) {
                    if(index < rules.length - 1){
                        index++;
                    }else{
                        index = 0;
                    }
                    break;
                }
            }
        }
    }
}