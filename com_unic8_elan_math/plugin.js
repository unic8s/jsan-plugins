module.exports = {
    options: null,
    outputs: null,
    powBase: 0,
    powExp: 0,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;
    },
    input: function (id, data) {
        switch (id) {
            case "abs":
                this.outputs.abs = Math.abs(data);
                break;
            case "ceil":
                this.outputs.ceil = Math.ceil(data);
                break;
            case "cos":
                this.outputs.cos = Math.cos(data);
                break;
            case "floor":
                this.outputs.floor = Math.floor(data);
                break;
            case "pow base":
                this.powBase = data;
                break;
            case "pow exp":
                this.powExp = data;
                break;
            case "round":
                this.outputs.round = Math.round(data);
                break;
            case "sin":
                this.outputs.sin = Math.sin(data);
                break;
            case "sqrt":
                this.outputs.sqrt = Math.sqrt(data);
                break;
        }

        switch (id) {
            case "pow base":
            case "pow exp":
                this.outputs.pow = Math.pow(this.powBase, this.powExp);
                break;
        }
    }
}