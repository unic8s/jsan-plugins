module.exports = {
    options: null,
    outputs: null,
    min: 0,
    max: 0,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;
    },
    input: function (id, data) {
        switch (id) {
            case "Min":
                this.min = data;
                break;
            case "Max":
                this.max = data;
                break;
            case "Trigger":
                this.outputs.Random = Math.random() * (this.max - this.min) + this.min;
                break;
        }
    }
}