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
            case "addA":
                this.addA = data;
                break;
            case "addB":
                this.addB = data;
                break;
            case "subA":
                this.subA = data;
                break;
            case "subB":
                this.subB = data;
                break;
            case "mltA":
                this.mltA = data;
                break;
            case "mltB":
                this.mltB = data;
                break;
            case "divA":
                this.divA = data;
                break;
            case "divB":
                this.divB = 1 / data;
                break;
        }

        const outputs = this.options.outputs;

        switch (id) {
            case "addA":
            case "addB":
                outputs.Add = this.addA + this.addB;
                break;
            case "subA":
            case "subB":
                outputs.Sub = this.subA - this.subB;
                break;
            case "mltA":
            case "mltB":
                outputs.Mlt = this.mltA * this.mltB;
                break;
            case "divA":
            case "divB":
                outputs.Div = this.divB != 0 ? this.divA * this.divB : this.divA;
                break;
        }
    }
}
