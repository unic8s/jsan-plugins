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

        if(Math.abs(time - this.lastUpdate) > 1000) {
            this.options.nodes.outputs.query("timestamp").data = Math.round(time / 1000);
            this.options.nodes.outputs.query("hours").data = now.getHours();
            this.options.nodes.outputs.query("minutes").data = now.getMinutes();
            this.options.nodes.outputs.query("seconds").data = now.getSeconds();

            this.lastUpdate = now;
        }
    }
}