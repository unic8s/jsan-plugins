module.exports = {
    options: null,
    addA: 0,
    addB: 0,
    subA: 0,
    subB: 0,
    mltA: 0,
    mltB: 0,
    divA: 0,
    divB: 0,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "Add A":
                this.addA = data;
                break;
            case "Add B":
                this.addB = data;
                break;
            case "Sub A":
                this.subA = data;
                break;
            case "Sub B":
                this.subB = data;
                break;
            case "Mlt A":
                this.mltA = data;
                break;
            case "Mlt B":
                this.mltB = data;
                break;
            case "Div A":
                this.divA = data;
                break;
            case "Div B":
                this.divB = 1 / data;
                break;
        }

        switch (id) {
            case "Add A":
            case "Add B":
                this.options.nodes.outputs.query("Add").data = this.addA + this.addB;
                break;
            case "Sub A":
            case "Sub B":
                this.options.nodes.outputs.query("Sub").data = this.subA - this.subB;
                break;
            case "Mlt A":
            case "Mlt B":
                this.options.nodes.outputs.query("Mlt").data = this.mltA * this.mltB;
                break;
            case "Div A":
            case "Div B":
                this.options.nodes.outputs.query("Div").data = this.divB != 0 ? this.divA * this.divB : this.divA;
                break;
        }
    }
}