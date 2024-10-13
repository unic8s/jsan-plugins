module.exports = {
    options: null,
    powBase: 0,
    powExp: 0,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "abs":
                this.options.nodes.outputs.query("abs").data = Math.abs(data);
                break;
            case "ceil":
                this.options.nodes.outputs.query("ceil").data = Math.ceil(data);
                break;
            case "cos":
                this.options.nodes.outputs.query("cos").data = Math.cos(data);
                break;
            case "floor":
                this.options.nodes.outputs.query("floor").data = Math.floor(data);
                break;
            case "pow base":
                this.powBase = data;
                break;
            case "pow exp":
                this.powExp = data;
                break;
            case "round":
                this.options.nodes.outputs.query("round").data = Math.round(data);
                break;
            case "sin":
                this.options.nodes.outputs.query("sin").data = Math.sin(data);
                break;
            case "sqrt":
                this.options.nodes.outputs.query("sqrt").data = Math.sqrt(data);
                break;
        }

        switch (id) {
            case "pow base":
            case "pow exp":
                this.options.nodes.outputs.query("pow").data = Math.pow(this.powBase, this.powExp);
                break;
        }
    }
}