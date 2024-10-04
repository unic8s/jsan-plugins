module.exports = {
    options: null,
    dimensions: null,
    container: null,
    timeStamp: 0,
    modern: false,
    smooth: false,
    colorHours: null,
    colorMinutes: null,
    colorSeconds: null,
    gfxSeconds: null,
    gfxMinutes: null,
    gfxHours: null,

    install: function (options) {
        this.options = options;

        const PIXI = this.options.PIXI.module;
        this.container = this.options.PIXI.instance;

        this.dimensions = this.options.params.canvas;

        this.timeStamp = options.nodes.inputs.query("time").data;
        this.colorHours = options.nodes.inputs.query("hours").data;
        this.colorMinutes = options.nodes.inputs.query("minutes").data;
        this.colorSeconds = options.nodes.inputs.query("seconds").data;

        this.gfxSeconds = new PIXI.Graphics();
        this.gfxMinutes = new PIXI.Graphics();
        this.gfxHours = new PIXI.Graphics();

        this.container.addChild(this.gfxHours);
        this.container.addChild(this.gfxMinutes);
        this.container.addChild(this.gfxSeconds);

        this.position();
        this.draw();
    },
    uninstall: function () {
        this.gfxSeconds.destroy();
        this.gfxMinutes.destroy();
        this.gfxHours.destroy();
    },
    input: function (id, data) {
        switch (id) {
            case "time":
                this.timeStamp = data;
                break;
            case "modern":
                this.modern = data;
                break;
            case "smooth":
                this.smooth = data;
                break;
            case "hours":
                this.colorHours = data;
                break;
            case "minutes":
                this.colorMinutes = data;
                break;
            case "seconds":
                this.colorSeconds = data;
                break;
        }

        this.draw();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.position();
        this.draw();
    },
    render: function () {
        const now = this.timeStamp < 0 ? new Date() : new Date(this.timeStamp * 1000);
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const milliseconds = this.smooth ? now.getMilliseconds() : 0;
        const seconds = now.getSeconds() + milliseconds / 1000;

        if (this.modern) {
            this.gfxSeconds.rotation = -Math.PI >> 1;
            this.gfxMinutes.rotation = -Math.PI >> 1;
            this.gfxHours.rotation = -Math.PI >> 1;

            this.draw(hours, minutes, seconds);
        } else {
            const minutesSub = minutes + seconds / 60;
            const hoursSub = hours + minutesSub / 60;

            this.gfxSeconds.rotation = Math.PI * 2 / 60 * seconds;
            this.gfxMinutes.rotation = Math.PI * 2 / 60 * minutesSub;
            this.gfxHours.rotation = Math.PI * 2 / 12 * hoursSub;
        }
    },
    blend: function (mode) {
        this.gfxHours.blendMode = mode;
        this.gfxMinutes.blendMode = mode;
        this.gfxSeconds.blendMode = mode;
    },

    position: function () {
        const x = this.dimensions.width >> 1;
        const y = this.dimensions.height >> 1;

        this.gfxSeconds.position.set(x, y);
        this.gfxSeconds.pivot.set(x, y);

        this.gfxMinutes.position.set(x, y);
        this.gfxMinutes.pivot.set(x, y);

        this.gfxHours.position.set(x, y);
        this.gfxHours.pivot.set(x, y);
    },
    draw: function (hours, minutes, seconds) {
        const x = this.dimensions.width >> 1;
        const y = this.dimensions.height >> 1;

        let minutesSub = (minutes + seconds / 60);

        let arcRadius = Math.min(this.dimensions.width, this.dimensions.height) >> 1;
        const arcWidth = arcRadius / 10;
        arcRadius -= arcWidth;

        let size;

        this.gfxSeconds.clear();

        if (this.modern) {
            this.gfxSeconds.lineStyle(arcWidth, this.colorSeconds, 1, true);
            this.gfxSeconds.arc(x, y, arcRadius - 2, 0, Math.PI * 2 / 60 * seconds);
        } else {
            size = 1;

            this.gfxSeconds.beginFill(this.colorSeconds);
            this.gfxSeconds.drawPolygon([
                { x: x - size, y: y + size },
                { x: x, y: y >> 3 },
                { x: x + size, y: y + size },
            ]);
            this.gfxSeconds.endFill();
        }

        this.gfxMinutes.clear();

        if (this.modern) {
            arcRadius -= arcWidth + 3;

            this.gfxMinutes.lineStyle(arcWidth, this.colorMinutes, 1, true);
            this.gfxMinutes.arc(x, y, arcRadius, 0, Math.PI * 2 / 60 * minutesSub);
        } else {
            size = 1.25;

            this.gfxMinutes.beginFill(this.colorMinutes);
            this.gfxMinutes.drawPolygon([
                { x: x - size, y: y + size },
                { x: x, y: y >> 2 },
                { x: x + size, y: y + size },
            ]);
            this.gfxMinutes.endFill();
        }

        this.gfxHours.clear();

        if (this.modern) {
            arcRadius -= arcWidth + 1;

            this.gfxHours.lineStyle(arcWidth, this.colorHours, 1, true);

            if (hours >= 12) {
                hours -= 12;
            }

            this.gfxHours.arc(x, y, arcRadius, 0, Math.PI * 2 / 12 * (hours + minutesSub / 60));
        } else {
            size = 1.5;

            this.gfxHours.beginFill(this.colorHours);
            this.gfxHours.drawPolygon([
                { x: x - size, y: y + size },
                { x: x, y: y >> 1 },
                { x: x + size, y: y + size },
            ]);
            this.gfxHours.endFill();
        }
    }
}