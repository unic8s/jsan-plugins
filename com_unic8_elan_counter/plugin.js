module.exports = {
    options: null,
    counter: 0,
    limit: 0,
    delay: 1000,
    active: false,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "Trigger":
                if (this.limit == 0 || this.counter < this.limit) {
                    this.options.nodes.outputs.query("active").data = true;

                    this.counter++;
                } else {
                    this.options.nodes.outputs.query("active").data = false;

                    if (this.reset) {
                        this.counter = 0;
                    }
                }
                break;
            case "Limit":
                if (this.counter > data) {
                    this.counter = data;
                }

                this.limit = data;
                break;
            case "Reset":
                this.counter = 0;
                break;
        }

        this.options.nodes.outputs.query("Counter").data = this.counter;
    }
}