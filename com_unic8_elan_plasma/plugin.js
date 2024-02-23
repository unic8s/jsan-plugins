module.exports = {
    options: null,
    dimensions: null,
    container: null,
    PIXI: null,
    canvas: null,
    context: null,
    CycleSpeed: 1,
    PlasmaDensity: 64,
    TimeFunction: 512,
    PlasmaFunction: 0,
    Jitter: 0,
    Alpha: 0.1,
    PaletteIndex: 2,
    paletteoffset: 0,
    palettes: [],

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        this.container = options.PIXI.instance;
        this.PIXI = options.PIXI.module;

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.context = this.canvas.getContext("2d", {
            willReadFrequently: true
        });

        this.container.texture = this.PIXI.Texture.from(this.canvas);

        var palette = [];
        for (let i = 0; i < 256; i++) {
            palette.push(this.rgb(i, i, i));
        }
        this.palettes.push(palette);

        palette = [];
        for (let i = 0; i < 128; i++) {
            palette.push(this.rgb(i * 2, i * 2, i * 2));
        }
        for (let i = 0; i < 128; i++) {
            palette.push(this.rgb(255 - (i * 2), 255 - (i * 2), 255 - (i * 2)));
        }
        this.palettes.push(palette);

        palette = new Array(256);
        for (let i = 0; i < 64; i++) {
            palette[i] = this.rgb(i << 2, 255 - ((i << 2) + 1), 64);
            palette[i + 64] = this.rgb(255, (i << 2) + 1, 128);
            palette[i + 128] = this.rgb(255 - ((i << 2) + 1), 255 - ((i << 2) + 1), 192);
            palette[i + 192] = this.rgb(0, (i << 2) + 1, 255);
        }
        this.palettes.push(palette);

        palette = [];
        for (let i = 0, r, g, b; i < 256; i++) {
            r = ~~(128 + 128 * Math.sin(Math.PI * i / 32));
            g = ~~(128 + 128 * Math.sin(Math.PI * i / 64));
            b = ~~(128 + 128 * Math.sin(Math.PI * i / 128));
            palette.push(this.rgb(r, g, b));
        }
        this.palettes.push(palette);

        palette = [];
        for (let i = 0, r, g, b; i < 256; i++) {
            r = ~~(Math.sin(0.3 * i) * 64 + 190),
                g = ~~(Math.sin(0.3 * i + 2) * 64 + 190),
                b = ~~(Math.sin(0.3 * i + 4) * 64 + 190);
            palette.push(this.rgb(r, g, b));
        }
        this.palettes.push(palette);

        this.draw();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.container.texture.destroy(true);
        this.container.texture = this.PIXI.Texture.from(this.canvas);
    },
    input: function (id, data) {
        switch (id) {
            case "speed":
                if (data < 0) {
                    data = 0;
                }

                this.CycleSpeed = data;
                break;
            case "density":
                if (data < 1) {
                    data = 1;
                }

                this.PlasmaDensity = data * 16;
                break;
            case "time":
                if (data < 1) {
                    data = 1;
                }

                this.TimeFunction = data * 64;
                break;
        }
    },
    render() {
        this.draw();

        this.container.texture.update();
    },

    draw() {
        var w = this.dimensions.width, h = this.dimensions.height,
            pw = this.PlasmaDensity, ph = (pw * (h / w)),
            palette = this.palettes[this.PaletteIndex],
            paletteoffset = this.paletteoffset += this.CycleSpeed;

        var vpx = (w / pw), vpy = (h / ph);

        this.context.save();
        this.context.globalAlpha = this.Alpha;
        var jitter = this.Jitter ? (-this.Jitter + (Math.random() * this.Jitter * 2)) : 0;
        for (var y = 0, x; y < ph; y++) {
            for (x = 0; x < pw; x++) {
                this.context.fillStyle = palette[(~~this.colour(x, y) + paletteoffset) % 256];
                this.context.fillRect(x * vpx + jitter, y * vpy + jitter, vpx, vpy);
            }
        }

        this.context.restore();
    },
    rgb(r, g, b) {
        return "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
    },
    dist(a, b, c, d) {
        return Math.sqrt((a - c) * (a - c) + (b - d) * (b - d));
    },
    colour(x, y) {
        var time = Date.now() / this.TimeFunction;

        switch (this.PlasmaFunction) {
            case 0:
                return ((Math.sin(this.dist(x + time, y, 128.0, 128.0) / 8.0)
                    + Math.sin(this.dist(x - time, y, 64.0, 64.0) / 8.0)
                    + Math.sin(this.dist(x, y + time / 7, 192.0, 64) / 7.0)
                    + Math.sin(this.dist(x, y, 192.0, 100.0) / 8.0)) + 4) * 32;
            case 1:
                var w = this.dimensions.width;
                var h = this.dimensions.height;

                return (128 + (128 * Math.sin(x * 0.0625)) +
                    128 + (128 * Math.sin(y * 0.03125)) +
                    128 + (128 * Math.sin(this.dist(x + time, y - time, w, h) * 0.125)) +
                    128 + (128 * Math.sin(Math.sqrt(x * x + y * y) * 0.125))) * 0.25;
        }
    }
}