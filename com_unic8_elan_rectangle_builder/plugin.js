module.exports = {
    options: null,
    outputs: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;

        this.outputs.bounds = new window.u8.mate.geom.Rectangle(0, 0, 0, 0);
    },
    input: function (id, data) {
        this[id] = data;

        this.outputs.bounds = new window.u8.mate.geom.Rectangle(this.x, this.y, this.width, this.height);
    }
}