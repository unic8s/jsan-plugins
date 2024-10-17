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
            case "AND A":
                this.andA = data;
                break;
            case "AND B":
                this.andB = data;
                break;
            case "OR A":
                this.orA = data;
                break;
            case "OR B":
                this.orB = data;
                break;
            case "XOR A":
                this.xorA = data;
                break;
            case "XOR B":
                this.xorB = data;
                break;
            case "NAND A":
                this.nandA = data;
                break;
            case "NAND B":
                this.nandB = data;
                break;
            case "NOR A":
                this.norA = data;
                break;
            case "NOR B":
                this.norB = data;
                break;
        }

        const outputs = this.options.outputs;

        switch (id) {
            case "NOT":
                outputs.NOT = !data;
                break;
            case "AND A":
            case "AND B":
                outputs.AND = this.andA && this.andB;
                break;
            case "OR A":
            case "OR B":
                outputs.OR = this.orA || this.orB;
                break;
            case "XOR A":
            case "XOR B":
                outputs.XOR = this.xorA ^ this.xorB;
                break;
            case "NAND A":
            case "NAND B":
                outputs.NAND = !(this.nandA && this.andB);
                break;
            case "NOR A":
            case "NOR B":
                outputs.NOR = !(this.norA || this.norB);
                break;
        }
    }
}
