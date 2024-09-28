module.exports = {
    options: null,
    dimensions: null,
    container: null,
    PIXI: null,
    sprite: null,
    canvas: null,
    context: null,
    points: 4,
    color: "#FFFFFF",
    speed: 1,
    trail: 10,
    bezier: false,
    vertices: [],
    timeoutID: null,

    install: function (options) {
        this.options = options;
        this.dimensions = this.options.params.canvas;
        this.container = this.options.PIXI.instance;

        this.PIXI = options.PIXI.module;

        this.sprite = new this.PIXI.Sprite();
        this.sprite.pivot.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.sprite.position.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.container.addChild(this.sprite);

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.context = this.canvas.getContext("2d", {
            willReadFrequently: true
        });

        this.sprite.texture = this.PIXI.Texture.from(this.canvas);

        this.setup();
    },
    uninstall: function () {
        this.sprite.destroy();

        this.killAnimations();
    },
    blend: function(mode) {
        this.sprite.blendMode = mode;
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.sprite.texture.destroy(true);
        this.sprite.texture = this.PIXI.Texture.from(this.canvas);
        this.sprite.pivot.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.sprite.position.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
    },
    input: function (id, data) {
        switch (id) {
            case "Points":
                this.points = data > 1 ? data : 2;
                break;
            case "Color":
                this.color = data;
                return;
            case "Speed":
                this.speed = data > 0 ? data : 0.01;
                break;
            case "Trail":
                this.trail = data > 0 ? data : 1;
                break;
            case "Bezier":
                this.bezier = data;
                break;
        }

        this.setup();
    },
    killAnimations: function () {
        cancelAnimationFrame(this.timeoutID);

        for (let c = 0; c < this.vertices.length; c++) {
            const vertex = this.vertices[c];

            window.TweenLite.killTweensOf(vertex);
        }
    },
    setup: function () {
        this.killAnimations();

        this.vertices = [];

        for (let c = 0; c < this.points; c++) {
            const vertex = this.randomVertex();
            this.vertices.push(vertex);

            this.animateVertex(vertex);
        }

        this.context.rect(0, 0, this.dimensions.width, this.dimensions.height);
        this.context.fill();

        this.draw();
    },
    randomVertex: function () {
        return {
            x: Math.random() * this.dimensions.width | 0,
            y: Math.random() * this.dimensions.height | 0,
            anchor: {
                x1: Math.random() * this.dimensions.width | 0,
                y1: Math.random() * this.dimensions.height | 0,
                x2: Math.random() * this.dimensions.width | 0,
                y2: Math.random() * this.dimensions.height | 0
            }
        };
    },
    animateVertex: function (vertex) {
        const next = this.randomVertex();

        const refThis = this;

        window.TweenLite.to(vertex, Math.random() * this.speed + this.speed,
            {
                x: next.x,
                y: next.y,
                ease: window.Linear.easeNone,
                onComplete: () => {
                    refThis.animateVertex(vertex);
                }
            }
        );
    },
    draw: function () {
        this.context.strokeStyle = this.color;
        this.context.globalAlpha = 1 / (this.trail * 2);
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.context.globalAlpha = 1;
        this.context.beginPath();

        for (let c = 0; c < this.vertices.length; c++) {
            const vertex = this.vertices[c]

            if (c == 0) {
                this.context.moveTo(vertex.x, vertex.y);
            }

            if (this.bezier) {
                this.context.bezierCurveTo(vertex.anchor.x1, vertex.anchor.y1, vertex.anchor.x1, vertex.anchor.y2, vertex.x, vertex.y);
            } else {
                this.context.lineTo(vertex.x, vertex.y);
            }
        }

        const first = this.vertices[0];

        this.context.lineTo(first.x, first.y);
        this.context.stroke();

        this.sprite.texture.update();

        const refThis = this;

        this.timeoutID = requestAnimationFrame(() => {
            refThis.draw();
        });
    }
}