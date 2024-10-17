module.exports = {
    options: null,
    timestamp: -1,
    lastUpdate: 0,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "timestamp":
                this.timestamp = data;
                break;
        }
    },
    render: function() {
        const now = this.timestamp >= 0 ? new Date(this.timestamp * 1000) : new Date();
        const time = now.getTime();
        const outputs = this.options.outputs;

        if(Math.abs(time - this.lastUpdate) > 1000) {
            this.outputs.timestamp = Math.round(time / 1000);
            this.outputs.hours = now.getHours();
            this.outputs.minutes = now.getMinutes();
            this.outputs.seconds = now.getSeconds();

            this.lastUpdate = now;
        }
    }
}
