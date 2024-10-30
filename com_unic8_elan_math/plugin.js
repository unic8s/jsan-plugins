module.exports = {
    options: null,
    powBase: 0,
    powExp: 0,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        const outputs = this.options.outputs;
        
        switch (id) {
            case "abs":
                outputs.abs = Math.abs(data);
                break;
            case "ceil":
                outputs.ceil = Math.ceil(data);
                break;
            case "cos":
                outputs.cos = Math.cos(data);
                break;
            case "floor":
                outputs.floor = Math.floor(data);
                break;
            case "powBase":
                this.powBase = data;
                break;
            case "powExp":
                this.powExp = data;
                break;
            case "round":
                outputs.round = Math.round(data);
                break;
            case "sin":
                outputs.sin = Math.sin(data);
                break;
            case "sqrt":
                outputs.sqrt = Math.sqrt(data);
                break;
        }

        switch (id) {
            case "powBase":
            case "powExp":
                outputs.pow = Math.pow(this.powBase, this.powExp);
                break;
        }
    }
}
