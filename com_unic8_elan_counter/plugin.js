module.exports = {
    options: null,
    outputs: null,
    counter: 0,
    limit: 0,
    repeat: true,
    delay: 1000,
    active: false,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;
    },
    input: function (id, data) {
        switch (id) {
            case "Trigger":
                if (this.limit == 0 || this.counter < this.limit) {
                    this.outputs.active = true;

                    this.counter++;
                } else {
                    this.outputs.active = false;

                    if (this.repeat || this.reset) {
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
            case "Repeat":
                this.repeat = data;
                break;
            case "Reset":
                this.counter = 0;
                break;
        }

        this.outputs.Counter = this.counter;
    }
}