module.exports = {
    options: null,
    dimensions: null,
    container: null,
    PIXI: null,
    sprite: null,
    canvas: null,
    context: null,
    gradientList: [],
    gradientDetails: [],
    schemeList: [],
    schemeIndex: -1,
    scheme: null,
    color: "#FFFFFF",
    peaks: [],
    lengthFactor: 0,
    mode: 0,
    width: 1,
    speed: 0,
    trail: 1,
    gap: 1,
    freqData: null,
    timeData: null,
    sineOffsets: [0, 0, 0],

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

        const inputs = options.inputs;

        this.mode = inputs.mode;
        this.width = inputs.width;
        this.speed = inputs.speed;

        this.resize(this.dimensions);
    },
    uninstall: function () {
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

        let peakAmount = this.dimensions.width | 0;

        if (peakAmount < 0) {
            peakAmount = 0;
        }

        this.peaks = new Array(peakAmount);
        this.lengthFactor = this.dimensions.height / 255;

        this.context.clearRect(0, 0, this.dimensions.width, this.dimensions.height);
    },
    blend: function (mode) {
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
            case "trail":
                this.trail = data > 0 ? data : 1;
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
            case "color":
                this.color = data;
                break;
        }
    },
    microphoneFrequencies: function (event) {
        this.freqData = event.data;

        this.draw();
    },
    microphoneTimedomain: function (event) {
        this.timeData = event.data;

        this.draw();
    },
    microphoneActive: function () {
        if (!this.container) {
            return;
        }

        this.container.visible = true;
    },
    microphoneInactive: function () {
        if (!this.container) {
            return;
        }

        this.container.visible = false;
    },
    draw() {
        if (!this.freqData || !this.timeData) {
            return;
        }

        const style = this.schemeIndex > -1 ? this.scheme : this.color;

        this.context.fillStyle = style;
        this.context.strokeStyle = style;

        const speedMlt = this.dimensions.height;
        const increment = this.width + this.gap;

        const stampAlpha = 1 - this.trail / 100;
        const stampStyle = "rgba(0,0,0," + stampAlpha + ")";

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
                this.context.fillStyle = stampStyle;
                this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
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
                this.context.drawImage(this.canvas, this.speed, -this.speed);
                this.context.fillStyle = stampStyle;
                this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
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
                this.context.fillStyle = stampStyle;
                this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);

                var freqSplit = Math.floor(this.freqData.length / 3);
                var freqSegments = [0, 0, 0];
                var freqDivider = [8, 4, 2];
                var freqColors = this.schemeIndex < 0 || this.schemeIndex >= this.gradientDetails.length || this.gradientDetails[this.schemeIndex].length < 3 ?
                    [this.color, this.color, this.color]:
                    [this.gradientDetails[this.schemeIndex][0].color, this.gradientDetails[this.schemeIndex][1].color, this.gradientDetails[this.schemeIndex][2].color];

                for (let c = 0; c < this.freqData.length; c++) {
                    if (c < freqSplit) {
                        freqSegments[0] += this.freqData[c];
                    } else if (c < freqSplit * 2) {
                        freqSegments[1] += this.freqData[c];
                    } else {
                        freqSegments[2] += this.freqData[c];
                    }
                }

                for (let c = 0; c < freqSegments.length; c++) {
                    freqSegments[c] /= freqSplit;
                    this.sineOffsets[c] += freqSegments[c] / freqDivider[c] / this.dimensions.width * this.speed + (3 - c) / this.dimensions.width;

                    var sinLimit = Math.PI * freqDivider[c];

                    if (this.sineOffsets[c] <= sinLimit) {
                        this.sineOffsets[c] += sinLimit;
                    } else if (this.sineOffsets[c] >= sinLimit) {
                        this.sineOffsets[c] -= sinLimit;
                    }
                }

                var centerY = (this.dimensions.height >> 1);

                for (let c1 = 0; c1 < freqSegments.length; c1++) {
                    var velocity = freqSegments[c1];
                    var divider = freqDivider[c1];

                    this.context.strokeStyle = freqColors[c1];
                    this.context.beginPath();

                    for (let c2 = 0; c2 < this.dimensions.width; c2++) {
                        if (c2 == 0) {
                            this.context.moveTo(0, centerY | 0);
                        }

                        var yPos = (this.dimensions.height / 512 * Math.sin((c2 + this.sineOffsets[c1]) / divider) * velocity);

                        this.context.lineTo(c2, centerY + yPos);
                    }

                    this.context.stroke();
                }
                break;
            case 5:
                var width = this.width > 0 ? this.width : 1;

                var step = Math.PI * 2 / (this.freqData.length / width);
                var index = 0;

                this.context.drawImage(this.canvas, -this.speed, -this.speed, this.dimensions.width + this.speed * 2, this.dimensions.height + this.speed * 2);
                this.context.fillStyle = stampStyle;
                this.context.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
                this.context.beginPath();

                var first = 0;
                var last = 0;
                var full = Math.PI * 2;

                for (let c = 0; c < full; c += step) {
                    let adjustedLength = this.lengthFactor * 0.5 * this.freqData[index];

                    if (this.gap > 0 && this.speed < 0) {
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

                    if (value < 0) {
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

    buildGradients: function () {
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

        this.gradientDetails.push(definition);

        for (let c = 0; c < definition.length; c++) {
            const def = definition[c];

            gradient.addColorStop(def.index, def.color);
        }

        this.gradientList[name] = gradient;

        if (!this.scheme) {
            this.scheme = gradient;
        }

        this.schemeList.push(name);
    }
}
