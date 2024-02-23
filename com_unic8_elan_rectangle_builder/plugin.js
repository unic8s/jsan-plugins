module.exports = {
    options: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,

    install: function (options) {
        this.options = options;

        this.options.nodes.outputs.query("bounds").data = new window.u8.mate.geom.Rectangle(0, 0, 0, 0);
    },
    input: function (id, data) {
        this[id] = data;

        this.options.nodes.outputs.query("bounds").data = new window.u8.mate.geom.Rectangle(this.x, this.y, this.width, this.height);
    }
}