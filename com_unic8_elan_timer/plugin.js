module.exports = {
    options: null,
    counter: 0,
    cycles: 0,
    delay: 1000,
    active: false,
    toggle: false,
    timeoutID: null,
    lastTime: 0,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "Cycles":
                this.cycles = data;
                break;
            case "Delay":
                this.delay = data;
                break;
            case "Active":
                this.active = data;
                break;
        }

        this.counter = 0;
        this.lastTime = this.getTime();
    },
    render: function () {
        if (this.active && (this.cycles == 0 || this.counter < this.cycles)) {
            const now = this.getTime();
            const increment = this.delay >= 1 ? this.delay : 1;

            while (now - this.lastTime >= this.delay) {
                this.lastTime += increment;

                this.tick();
            }
        }
    },

    getTime: function () {
        return Number((parseInt(process.hrtime.bigint()) * 0.000001).toFixed(0));
    },
    tick() {
        this.counter++;
        this.toggle = !this.toggle;

        this.options.nodes.outputs.query("Toggle").data = this.toggle;
    }
}