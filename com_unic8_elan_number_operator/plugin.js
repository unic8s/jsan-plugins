module.exports = {
    options: null,
    eqA: 0,
    eqB: 0,
    grA: 0,
    grB: 0,
    mdA: 0,
    mdB: 0,
    mnA: 0,
    mnB: 0,
    mxA: 0,
    mxB: 0,

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
            case "MinA":
                this.mnA = data;
                break;
            case "MinB":
                this.mnB = data;
                break;
            case "MaxA":
                this.mxA = data;
                break;
            case "MaxB":
                this.mxB = data;
                break;
        }

        const outputs = this.options.outputs;

        switch (id) {
            case "EqA":
            case "EqB":
                outputs.Eq = this.eqA === this.eqB;
                break;
            case "GtA":
            case "GtB":
                outputs.Gt = this.grA > this.grB;
                break;
            case "ModA":
            case "ModB":
                outputs.Mod = this.mdA % this.mdB;
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
            case "MinA":
            case "MinB":
                outputs.Min = Math.min(this.mnA, this.mnB);
                break;
            case "MaxA":
            case "MaxB":
                outputs.Max = Math.max(this.mxA, this.mxB);
                break;
        }
    }
}
