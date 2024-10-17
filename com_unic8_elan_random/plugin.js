module.exports = {
    options: null,
    min: 0,
    max: 0,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "Min":
                this.min = data;
                break;
            case "Max":
                this.max = data;
                break;
            case "Trigger":
                this.options.outputs.Random = Math.random() * (this.max - this.min) + this.min;
                break;
        }
    }
}
