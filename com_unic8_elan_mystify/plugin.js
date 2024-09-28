module.exports = {
    options: null,
    dimensions: null,
    container: null,
    gfx: null,
    points: 4,
    color: "#FFFFFF",
    speed: 1,
    trail: 10,
    vertices: [],
    timeoutID: null,
    alive: true,

    install: function (options) {
        this.options = options;
        this.dimensions = this.options.params.canvas;
        this.container = this.options.PIXI.instance;

        const PIXI = this.options.PIXI.module;

        this.gfx = new PIXI.Graphics();
        this.gfx.blendMode = this.container.blendMode;

        this.container.addChild(this.gfx);

        this.setup();
    },
    uninstall: function () {
        this.alive = false;

        cancelAnimationFrame(this.timeoutID);
    },
    input: function (id, data) {
        switch (id) {
            case "Points":
                this.points = data;
                break;
            case "Color":
                this.color = data;
                break;
            case "Speed":
                this.speed = data > 0 ? data : 0.01;
                break;
            case "Trail":
                this.trail = data > 0 ? data : 1;
                break;
        }

        this.setup();
    },
    setup: function () {
        for (let c = 0; c < this.vertices.length; c++) {
            const vertex = this.vertices[c];

            window.TweenLite.killTweensOf(vertex);
        }

        this.gfx.lineStyle({
            width: 1,
            color: this.color,
            native: true
        });

        this.vertices = [];

        for (let c = 0; c < this.points; c++) {
            const vertex = this.randomVertex();
            this.vertices.push(vertex);

            this.animateVertex(vertex);
        }

        this.draw();
    },
    randomVertex: function () {
        return {
            x: Math.random() * this.dimensions.width | 0,
            y: Math.random() * this.dimensions.height | 0
        };
    },
    animateVertex: function (vertex) {
        const next = this.randomVertex();

        const refThis = this;

        window.TweenLite.killTweensOf(vertex);
        window.TweenLite.to(vertex, Math.random() * this.speed + this.speed,
            {
                x: next.x,
                y: next.y,
                ease: window.Linear.easeNone,
                onComplete: () => {
                    if (!refThis.alive) {
                        return;
                    }

                    refThis.animateVertex(vertex);
                }
            }
        );
    },
    draw: function () {
        cancelAnimationFrame(this.timeoutID);

        this.gfx.beginFill("#000000", 1 / (this.trail));
        this.gfx.drawRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.gfx.endFill();

        this.gfx.drawPolygon(this.vertices);

        const refThis = this;

        this.timeoutID = requestAnimationFrame(() => {
            refThis.draw();
        });
    }
}