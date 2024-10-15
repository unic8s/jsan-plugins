module.exports = {
    options: null,
    outputs: null,
    eqA: 0,
    eqB: 0,
    grA: 0,
    grB: 0,
    mdA: 0,
    mdB: 0,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;
    },
    input: function (id, data) {
        switch (id) {
            case "EqA":
                this.eqA = data;
                break;
            case "EqB":
                this.eqB = data;
                break;
            case "GtA":
                this.grA = data;
                break;
            case "GtB":
                this.grB = data;
                break;
            case "ModA":
                this.mdA = data;
                break;
            case "ModB":
                this.mdB = data;
                break;
        }

        switch (id) {
            case "EqA":
            case "EqB":
                this.options.EqOut = this.eqA === this.eqB;
                break;
            case "GtA":
            case "GtB":
                this.options.GtOut = this.grA > this.grB;
                break;
            case "ModA":
            case "ModB":
                this.options.ModOut = this.mdA % this.mdB;
                break;
            case "Floor":
                this.options.Floor = Math.floor(data);
                break;
            case "Ceil":
                this.options.Ceil = Math.ceil(data);
                break;
            case "Round":
                this.options.Round = Math.round(data);
                break;
        }
    }
}