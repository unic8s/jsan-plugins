module.exports = {
    options: null,
    eqA: 0,
    eqB: 0,
    grA: 0,
    grB: 0,
    mdA: 0,
    mdB: 0,

    install: function (options) {
        this.options = options;
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

        const outputs = this.options.outputs;

        switch (id) {
            case "EqA":
            case "EqB":
                outputs.EqOut = this.eqA === this.eqB;
                break;
            case "GtA":
            case "GtB":
                outputs.GtOut = this.grA > this.grB;
                break;
            case "ModA":
            case "ModB":
                outputs.ModOut = this.mdA % this.mdB;
                break;
            case "Floor":
                outputs.Floor = Math.floor(data);
                break;
            case "Ceil":
                outputs.Ceil = Math.ceil(data);
                break;
            case "Round":
                outputs.Round = Math.round(data);
                break;
        }
    }
}
