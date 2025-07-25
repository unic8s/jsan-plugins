module.exports = {
    options: null,
    andA: false,
    andB: false,
    orA: false,
    orB: false,
    xorA: false,
    xorB: false,
    nandA: false,
    nandB: false,
    norA: false,
    norB: false,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "andA":
                this.andA = data;
                break;
            case "andB":
                this.andB = data;
                break;
            case "orA":
                this.orA = data;
                break;
            case "orB":
                this.orB = data;
                break;
            case "xorA":
                this.xorA = data;
                break;
            case "xorB":
                this.xorB = data;
                break;
            case "nandA":
                this.nandA = data;
                break;
            case "nandB":
                this.nandB = data;
                break;
            case "norA":
                this.norA = data;
                break;
            case "norB":
                this.norB = data;
                break;
        }

        const outputs = this.options.outputs;

        switch (id) {
            case "not":
                outputs.not = !data;
                break;
            case "andA":
            case "andB":
                outputs.and = this.andA && this.andB;
                break;
            case "orA":
            case "orB":
                outputs.or = this.orA || this.orB;
                break;
            case "xorA":
            case "xorB":
                outputs.xor = this.xorA ^ this.xorB;
                break;
            case "nandA":
            case "nandB":
                outputs.nand = !(this.nandA && this.andB);
                break;
            case "norA":
            case "norB":
                outputs.nor = !(this.norA || this.norB);
                break;
        }
    }
}
