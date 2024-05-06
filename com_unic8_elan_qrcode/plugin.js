module.exports = {
    options: null,
    params: {
        scale: 16,
        margin: 1,
        color: {
            dark: "#000000FF",
            light: "#FFFFFFFF"
        }
    },
    text: "",

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "text":
                this.text = data;
                break;
            case "scale":
                this.params.scale = data;
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
            refThis.options.nodes.outputs.query("image").data = {
                fileID: url,
                path: url
            };
        });
    }
}