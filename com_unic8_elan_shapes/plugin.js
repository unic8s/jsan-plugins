module.exports = {
    options: null,
    dimensions: null,
    container: null,
    duration: 2,
    shapes: ["square", "circle", "star"],
    square: true,
    circle: true,
    star: true,
    line: 1,
    color: "#FFFFFF",
    outline: true,
    size: {
        start: 0,
        end: 25
    },
    alpha: {
        start: 1,
        end: 0
    },
    position: {
        x: 0, y: 0,
        width: 0, height: 0
    },
    random: {
        color: true,
        position: true,
        rotation: true
    },
    alive: true,

    install: function (options) {
        this.options = options;
        this.dimensions = this.options.params.canvas;
        this.container = options.PIXI.instance;
    },
    uninstall: function() {
        this.alive = false;
    },
    resize: function (bounds) {
        this.dimensions = bounds;
    },
    blend: function(mode) {
        for(let c = 0; c < this.container.children.length; c++){
            const gfx = this.container.children[c];
            gfx.blendMode = mode;
        }
    },
    input: function (id, data) {
        switch (id) {
            case "trigger":
                this.generate();
                return;
            case "duration":
            case "square":
            case "circle":
            case "star":
            case "line":
            case "color":
            case "outline":
            case "position":
                this[id] = data;
                break;
            case "startSize":
                this.size.start = data;
                break;
            case "endSize":
                this.size.end = data;
                break;
            case "startAlpha":
                this.alpha.start = data;
                break;
            case "endAlpha":
                this.alpha.end = data;
                break;
            case "randomColor":
                this.random.color = data;
                break;
            case "randomPosition":
                this.random.position = data;
                break;
            case "randomRotation":
                this.random.rotation = data;
                break;
        }

        this.shapes = [];

        if (this.square) {
            this.shapes.push("square");
        }

        if (this.circle) {
            this.shapes.push("circle");
        }

        if (this.star) {
            this.shapes.push("star");
        }
    },

    generate: function () {
        const randomIndex = Math.round(Math.random() * (this.shapes.length - 1));
        const randomShape = this.shapes[randomIndex];

        const PIXI = this.options.PIXI.module;

        const gfx = new PIXI.Graphics();
        gfx.alpha = this.alpha.start;
        gfx.scale.set(this.size.start * 0.01, this.size.start * 0.01);
        gfx.blendMode = this.container.blendMode;

        if (this.random.position) {
            gfx.x = Math.round(Math.random() * this.dimensions.width);
            gfx.y = Math.round(Math.random() * this.dimensions.height);
        } else {
            gfx.x = this.position.x;
            gfx.y = this.position.y;
        }

        if (this.random.rotation) {
            gfx.rotation = Math.random() * Math.PI * 2;
        }

        this.container.addChild(gfx);

        this.options.nodes.outputs.query("amount").data++;

        const color = this.random.color ? Math.round(Math.random() * 0xFFFFFF) : this.color;

        if (this.outline) {
            gfx.lineStyle({
                width: this.line,
                color: color,
                native: this.line == 1
            });
        } else {
            gfx.beginFill(color);
        }

        const size = Math.max(this.dimensions.width, this.dimensions.height);

        switch (randomShape) {
            case "square":
                gfx.drawRect(-size >> 1, -size >> 1, size, size);
                break;
            case "circle":
                gfx.drawCircle(0, 0, size >> 1);
                break;
            case "star":
                this.drawStar(gfx, 0, 0, 5, size >> 1, size, 90);
                break;
        }

        let item = {
            type: randomShape,
            gfx: gfx,
            alpha: this.alpha.start,
            size: this.size.start,
            rotation: gfx.rotation
        };

        const refThis = this;

        const rotation = this.random.rotation ? Math.random() * Math.PI * 2 : 0;

        window.TweenLite.to(item, this.duration,
            {
                alpha: this.alpha.end,
                size: this.size.end,
                rotation: rotation,
                ease: window.Linear.easeNone,
                onUpdate: () => {
                    const scale = item.size * 0.01;

                    item.gfx.alpha = item.alpha;
                    item.gfx.scale.set(scale, scale);
                    item.gfx.rotation = item.rotation
                },
                onComplete: () => {
                    refThis.container.removeChild(item.gfx);

                    item.gfx.destroy();

                    item = null;

                    if(refThis.alive){
                        refThis.options.nodes.outputs.query("amount").data--;
                    }
                }
            }
        );
    },
    drawStar: function (target, x, y, points, innerRadius, outerRadius, angle = 0) {
        let step, halfStep, start, n, dx, dy;
        step = (Math.PI * 2) / points;
        halfStep = step >> 1;
        start = (angle / 180) * Math.PI;
        target.moveTo(x + (Math.cos(start) * outerRadius), y - (Math.sin(start) * outerRadius));

        for (n = 1; n <= points; ++n) {
            dx = x + Math.cos(start + (step * n) - halfStep) * innerRadius;
            dy = y - Math.sin(start + (step * n) - halfStep) * innerRadius;
            target.lineTo(dx, dy);
            dx = x + Math.cos(start + (step * n)) * outerRadius;
            dy = y - Math.sin(start + (step * n)) * outerRadius;
            target.lineTo(dx, dy);
        }
    }
}