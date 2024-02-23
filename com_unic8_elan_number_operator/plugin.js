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
            case "= A":
                this.eqA = data;
                break;
            case "= B":
                this.eqB = data;
                break;
            case "> A":
                this.grA = data;
                break;
            case "> B":
                this.grB = data;
                break;
            case "% A":
                this.mdA = data;
                break;
            case "% B":
                this.mdB = data;
                break;
        }

        switch (id) {
            case "= A":
            case "= B":
                this.options.nodes.outputs.query("= Out").data = this.eqA === this.eqB;
                break;
            case "> A":
            case "> B":
                this.options.nodes.outputs.query("> Out").data = this.grA > this.grB;
                break;
            case "% A":
            case "% B":
                this.options.nodes.outputs.query("% Out").data = this.mdA % this.mdB;
                break;
            case "Floor":
                this.options.nodes.outputs.query("Floor").data = Math.floor(data);
                break;
            case "Ceil":
                this.options.nodes.outputs.query("Ceil").data = Math.ceil(data);
                break;
            case "Round":
                this.options.nodes.outputs.query("Round").data = Math.round(data);
                break;
        }
    }
}