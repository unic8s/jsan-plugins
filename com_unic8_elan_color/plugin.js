module.exports = {
    options: null,
    output: null,
    red: 0,
    green: 0,
    blue: 0,
    duration: 0,
    random: true,
    tween: null,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;
    },
    uninstall: function () {
        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }
    },
    input: function (id, data) {
        let colors = {
            red: this.red,
            green: this.green,
            blue: this.blue
        }

        switch (id) {
            case "trigger":
                if (this.random) {
                    colors.red = Math.random() * 255 | 0;
                    colors.green = Math.random() * 255 | 0;
                    colors.blue = Math.random() * 255 | 0;
                }
                break;
            case "duration":
                this.duration = data;
                break;
            case "random":
                this.random = true;
                break;
            case "red":
            case "green":
            case "blue":
                colors[id] = data;
                break;
        }

        if (this.duration > 0) {
            var refThis = this;

            this.tween = this.options.GSAP.TweenLite.to(this, this.duration, {
                red: colors.red,
                green: colors.green,
                blue: colors.blue,
                onUpdate: () => {
                    if(!refThis.tween){
                        return;
                    }
                    
                    refThis.updateColor();
                }
            });
        } else {
            this.red = colors.red;
            this.green = colors.green;
            this.blue = colors.blue;

            this.updateColor();
        }
    },

    updateColor() {
        this.outputs.color = this.rgbToHex(this.red, this.green, this.blue);
    },
    rgbToHex(r, g, b) {
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
    }
}