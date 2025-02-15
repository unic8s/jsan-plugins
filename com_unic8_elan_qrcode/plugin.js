module.exports = {
    options: null,
    params: {
        errorCorrectionLevel: "L",
        margin: 1,
        width: 0,
        color: {
            dark: "#000000FF",
            light: "#FFFFFFFF"
        }
    },
    text: "",

    install: function (options) {
        this.options = options;

        this.params.width = Math.max(this.options.params.canvas.width, this.options.params.canvas.width);
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.params.width = Math.max(this.dimensions.width, this.dimensions.height);

        this.generate();
    },
    input: function (id, data) {
        switch (id) {
            case "text":
                this.text = data;
                break;
            case "width":
                this.params.width = data;
                break;
            case "light":
                this.params.color.light = data + "FF";
                break;
            case "dark":
                this.params.color.dark = data + "FF";
                break;
        }

        this.generate();
    },

    generate() {
        const refThis = this;

        this.options.helpers.qrcode.toDataURL(this.text, this.params, function (err, url) {
            refThis.options.outputs.image = {
                fileID: url,
                path: url
            };
        });
    }
}
