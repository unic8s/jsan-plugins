module.exports = {
    options: null,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        this.options.nodes.outputs.query("x").data = data.x;
        this.options.nodes.outputs.query("y").data = data.y;
        this.options.nodes.outputs.query("width").data = data.width;
        this.options.nodes.outputs.query("height").data = data.height;
    }
}