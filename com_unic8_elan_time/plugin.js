module.exports = {
    options: null,
    timestamp: -1,
    intervalId: null,

    install: function (options) {
        this.options = options;

        this.startTimer();
    },
    uninstall: function() {
        this.stopTimer();
    },
    input: function (id, data) {
        this.stopTimer();

        switch (id) {
            case "timestamp":
                this.timestamp = data;
                break;
        }

        if(this.timestamp == -1){
            this.startTimer();
        }else{
            this.calculateTime();
        }
    },
    
    startTimer: function(){
        this.stopTimer();

        const refThis = this;

        this.intervalId = setInterval(() => {
            refThis.calculateTime();
        }, 1000);
    },
    stopTimer: function(){
        if(this.intervalId){
            clearInterval(this.intervalId);

            this.intervalId = null;
        }
    },
    calculateTime: function () {
        const now = this.timestamp >= 0 ? new Date(this.timestamp * 1000) : new Date();

        this.options.nodes.outputs.query("timestamp").data = Math.round(now.getTime() / 1000);
        this.options.nodes.outputs.query("hours").data = now.getHours();
        this.options.nodes.outputs.query("minutes").data = now.getMinutes();
        this.options.nodes.outputs.query("seconds").data = now.getSeconds();
    }
}