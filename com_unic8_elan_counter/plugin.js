module.exports = {
    options: null,
    counter: 0,
    limit: 0,
    repeat: true,
    delay: 1000,
    active: false,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "Trigger":
                if (this.limit == 0 || this.counter < this.limit) {
                    this.options.outputs.Active = true;

                    this.counter++;
                } else {
                    this.options.outputs.Active = false;

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

        this.options.outputs.Counter = this.counter;
    }
}
