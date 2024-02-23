module.exports = {
    options: null,
    fromLow: 0,
    fromHigh: 1,
    toLow: 0,
    toHigh: 1,
    value: 0,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "From low":
                this.fromLow = data;
                break;
            case "From high":
                this.fromHigh = data;
                break;
            case "To low":
                this.toLow = data;
                break;
            case "To high":
                this.toHigh = data;
                break;
            case "Value":
                this.value = data;
                break;
        }

        this.calculate();
    },

    calculate() {
        const fromRange = this.fromHigh - this.fromLow;
        const toRange = this.toHigh - this.toLow;
        const fromPercentage = 100 / fromRange * this.value;
        const calculated = toRange / 100 * fromPercentage + this.toLow;

        this.options.nodes.outputs.query("Output").data = calculated;
    }
}