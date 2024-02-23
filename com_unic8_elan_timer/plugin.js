module.exports = {
    options: null,
    counter: 0,
    cycles: 0,
    delay: 1000,
    active: false,
    toggle: false,
    timeoutID: null,

    install: function (options) {
        this.options = options;

        this.restartTimer();
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

        this.restartTimer();
    },
    uninstall: function () {
        clearTimeout(this.timeoutID);
    },

    restartTimer() {
        clearTimeout(this.timeoutID);

        if (this.active && (this.cycles == 0 || this.counter < this.cycles)) {
            this.timeoutID = setTimeout(() => {
                this.tick();
                this.restartTimer();
            }, this.delay);
        }
    },
    tick() {
        this.counter++;
        this.toggle = !this.toggle;

        this.options.nodes.outputs.query("Toggle").data = this.toggle;
    }
}