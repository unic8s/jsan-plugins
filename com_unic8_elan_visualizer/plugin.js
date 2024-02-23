module.exports = {
    options: null,
    dimensions: null,
    container: null,
    PIXI: null,
    sprite: null,
    canvas: null,
    context: null,
    gradientList: [],
    schemeList: [],
    schemeIndex: 0,
    scheme: null,
    peaks: [],
    lengthFactor: 0,
    mode: 0,
    width: 1,
    speed: 0,
    gap: 1,
    freqData: null,
    timeData: null,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        this.container = options.PIXI.instance;
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

        this.peaks = new Array(this.dimensions.width);
        this.lengthFactor = this.dimensions.height / 255;

        this.mode = options.nodes.inputs.query("mode").data;
        this.width = options.nodes.inputs.query("width").data;
        this.speed = options.nodes.inputs.query("speed").data;

        this.resize(this.dimensions);
    },
    uninstall: function() {
        this.sprite.destroy();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.canvas.width = this.dimensions.width;
        this.canvas.height = this.dimensions.height;

        this.buildGradients();

        const schemeName = this.schemeList[this.schemeIndex];
        this.scheme = this.gradientList[schemeName];

        this.sprite.texture.destroy(true);
        this.sprite.texture = this.PIXI.Texture.from(this.canvas);
        this.sprite.pivot.set(this.dimensions.width >> 1, this.dimensions.height >> 1);
        this.sprite.position.set(this.dimensions.width >> 1, this.dimensions.height >> 1);

        this.peaks = new Array(this.dimensions.width);
        this.lengthFactor = this.dimensions.height / 255;
    },
    blend: function(mode) {
        this.sprite.blendMode = mode;
    },
    input: function (id, data) {
        switch (id) {
            case "mode":
                this.mode = data;

                this.context.clearRect(0, 0, this.dimensions.width, this.dimensions.height);
                break;
            case "width":
                this.width = data >= 1 ? data : 1;
                break;
            case "speed":
                this.speed = data;
                break;
            case "scheme":
                var schemeName = this.schemeList[data];
                this.schemeIndex = data;

                this.scheme = this.gradientList[schemeName];
                break;
            case "gap":
                this.gap = data >= 0 ? data : 0;
                break;
            case "invert x":
                this.sprite.scale.x = data ? -1 : 1;
                break;
            case "invert y":
                this.sprite.scale.y = data ? -1 : 1;
                break;
        }
    },
    microphoneFrequencies: function (event) {
        this.freqData = event.data;
    },
    microphoneTimedomain: function (event) {
        this.timeData = event.data;
    },
    microphoneActive: function () {
        this.container.visible = true;
    },
    microphoneInactive: function () {
        this.container.visible = false;
    },
    render() {
        if (!this.freqData || !this.timeData) {
            return;
        }

        this.context.fillStyle = this.scheme;
        this.context.strokeStyle = this.scheme;

        const alphaDec = 255 / this.dimensions.height;
        const speedMlt = this.dimensions.height;
        const increment = this.width + this.gap;

        switch (this.mode) {
            case 0:
                this.context.clearRect(0, 0, this.dimensions.width, this.dimensions.height);

                for (let c = 0; c < this.dimensions.width; c += increment) {
                    let adjustedLength = this.lengthFactor * this.freqData[c];

                    if (this.peaks[c] == undefined || adjustedLength > this.peaks[c]) {
                        this.peaks[c] = adjustedLength;
                    } else if (this.peaks[c] > 0) {
                        this.peaks[c] -= 0.25 * this.speed;
                    }

                    this.context.fillRect(c, (this.dimensions.height - adjustedLength) | 0, this.width > 1 ? this.width : 1, this.dimensions.height);
                    this.context.fillRect(c, (this.dimensions.height - this.peaks[c]) | 0, this.width > 1 ? this.width : 1, 1);
                }
                break;
            case 1:
                this.context.clearRect(0, 0, this.dimensions.width, this.dimensions.height);

                this.context.beginPath();
                this.context.globalAlpha = 0.5;

                for (let c = 0; c < this.dimensions.width; c += increment) {
                    let adjustedLength = this.lengthFactor * this.timeData[c];

                    if (this.peaks[c] == undefined || adjustedLength > this.peaks[c]) {
                        this.peaks[c] = adjustedLength;
                    } else if (this.peaks[c] > 0) {
                        this.peaks[c] -= 0.25 * this.speed;
                    }

                    if (c == 0) {
                        this.context.moveTo(c, (this.dimensions.height - this.peaks[c]) | 0);
                    } else {
                        this.context.lineTo(c, (this.dimensions.height - this.peaks[c]) | 0);
                    }
                }

                this.context.stroke();
                this.context.beginPath();

                for (let c = 0; c < this.dimensions.width; c += increment) {
                    if (c == 0) {
                        this.context.moveTo(c, this.peaks[this.dimensions.width - c - 1]);
                    } else {
                        this.context.lineTo(c, this.peaks[this.dimensions.width - c - 1]);
                    }
                }

                this.context.stroke();
                this.context.globalAlpha = 1;
                this.context.beginPath();

                for (let c = 0; c < this.dimensions.width; c += increment) {
                    let adjustedLength = this.lengthFactor * this.timeData[c];

                    if (c == 0) {
                        this.context.moveTo(c, (this.dimensions.height - adjustedLength) | 0);
                    } else {
                        this.context.lineTo(c, (this.dimensions.height - adjustedLength) | 0);
                    }
                }

                this.context.stroke();
                break;
            case 2:
                this.context.globalAlpha = alphaDec * 0.1;
                this.context.fillStyle = "#000";
                this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
                this.context.globalAlpha = 1;
                this.context.beginPath();

                for (let c = 0; c < this.dimensions.width; c += increment) {
                    let adjustedLength = this.lengthFactor * this.timeData[c];

                    if (c == 0) {
                        this.context.moveTo(c, (this.dimensions.height - adjustedLength) | 0);
                    } else {
                        this.context.lineTo(c, (this.dimensions.height - adjustedLength) | 0);
                    }
                }

                this.context.stroke();
                break;
            case 3:
                this.context.globalAlpha = alphaDec * 0.1;
                this.context.drawImage(this.canvas, this.speed, -this.speed);
                this.context.globalAlpha = alphaDec * 0.01;
                this.context.fillStyle = "#000";
                this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
                this.context.globalAlpha = 1;
                this.context.beginPath();

                for (let c = 0; c < this.dimensions.width; c += increment) {
                    let adjustedLength = this.lengthFactor * this.freqData[c];

                    if (this.peaks[c] == undefined || adjustedLength > this.peaks[c]) {
                        this.peaks[c] = adjustedLength;
                    } else if (this.peaks[c] > 0) {
                        this.peaks[c] -= this.speed / speedMlt;
                    }

                    if (c == 0) {
                        this.context.moveTo(0, (this.dimensions.height - adjustedLength) | 0);
                    }

                    this.context.lineTo(c, (this.dimensions.height - adjustedLength) | 0);
                }

                this.context.stroke();
                break;
            case 4:
                this.context.drawImage(this.canvas, -this.speed, 0);
                this.context.globalAlpha = alphaDec * 0.01;
                this.context.fillStyle = "#000";
                this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
                this.context.globalAlpha = 1;

                var average = 0;

                for (let c = 0; c < this.dimensions.width; c += increment) {
                    average += this.freqData[c];
                }

                average /= this.freqData.length * 0.75;

                var adjustedLength = this.lengthFactor * average;

                this.context.fillStyle = this.scheme;
                this.context.fillRect(this.dimensions.width - 1, (this.dimensions.height - adjustedLength) | 0, 1, this.dimensions.height);
                break;
            case 5:
                var width = this.width > 0 ? this.width : 1;

                var step = Math.PI * 2 / (this.freqData.length / width);
                var index = 0;

                this.context.globalAlpha = alphaDec * 0.1;
                this.context.drawImage(this.canvas, -this.speed, -this.speed, this.dimensions.width + this.speed * 2, this.dimensions.height + this.speed * 2);
                this.context.globalAlpha = alphaDec * 0.01;
                this.context.fillStyle = "#000";
                this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
                this.context.globalAlpha = 1;
                this.context.beginPath();

                var first = 0;
                var last = 0;
                var full = Math.PI * 2;

                for (let c = 0; c < full; c += step) {
                    let adjustedLength = this.lengthFactor * 0.5 * this.freqData[index];

                    if(this.gap > 0 && this.speed < 0) {
                        adjustedLength *= -1;
                    }

                    if (c == 0) {
                        first = adjustedLength;
                    } else {
                        last = adjustedLength;
                    }

                    var end = c + step;

                    if (end > full) {
                        end = full;
                    }

                    let value = adjustedLength + this.gap;

                    if(value < 0){
                        value = 0;
                    }

                    this.context.arc(this.dimensions.width >> 1, this.dimensions.height >> 1, value, c, end);

                    index += width;
                }

                if (step < full) {
                    this.context.moveTo((this.dimensions.width >> 1) + first + this.gap, (this.dimensions.height >> 1) + 1);
                    this.context.lineTo((this.dimensions.width >> 1) + last + this.gap, (this.dimensions.height >> 1) - 1);
                }

                this.context.stroke();
                break;
        }

        this.sprite.texture.update();
    },

    buildGradients: function() {
        this.gradientList = [];
        this.schemeList = [];

        this.createGradient("retro", [
            { index: 0.0, color: "#f00" },
            { index: 0.5, color: "#ff0" },
            { index: 1.0, color: "#0f0" }
        ]);

        this.createGradient("spectrum", [
            { index: 0.0, color: "#f00" },
            { index: 0.25, color: "#ff0" },
            { index: 0.5, color: "#0f0" },
            { index: 0.75, color: "#ff0" },
            { index: 1.0, color: "#f00" }
        ]);

        this.createGradient("rainbow", [
            { index: 0.0, color: "#ff0000" },
            { index: 0.16, color: "#ff9900" },
            { index: 0.33, color: "#ffff00" },
            { index: 0.5, color: "#00ff00" },
            { index: 0.66, color: "#0000ff" },
            { index: 0.83, color: "#4b0082" },
            { index: 1.0, color: "#ee82ee" }
        ], this.dimensions.width);

        this.createGradient("white", [
            { index: 0.0, color: "#fff" }
        ]);

        this.createGradient("black", [
            { index: 0.0, color: "#000" }
        ]);
    },
    createGradient: function (name, definition, width = 0) {
        const gradient = this.context.createLinearGradient(0, 0, width, this.dimensions.height);

        for (let c = 0; c < definition.length; c++) {
            const def = definition[c];

            gradient.addColorStop(def.index, def.color);
        }

        this.gradientList[name] = gradient;

        if (!this.scheme) {
            this.scheme = gradient;
            this.schemeIndex = 0;
        }

        this.schemeList.push(name);
    }
}