module.exports = {
    options: null,
    outputs: null,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;
    },
    input: function (id, data) {
        this.outputs.x = data.x;
        this.outputs.y = data.y;
        this.outputs.width = data.width;
        this.outputs.height = data.height;
    }
}