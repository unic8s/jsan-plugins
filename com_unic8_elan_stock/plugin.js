module.exports = {
    options: null,
    appID: '6426bd9b96736f6bab6469bf72afa05c',
    intervalTime: 60000,
    intervalID: null,
    symbol: "",
    amount: 1,
    period: 0,
    duration: 1,
    frequency: 0,
    jsonData: null,

    install: function (options) {
        this.options = options;

        const inputs = options.inputs;

        this.symbol = inputs.symbol;
        this.amount = inputs.amount;
        this.period = inputs.period;
        this.duration = inputs.duration;
        this.frequency = inputs.frequency;

        this.startPolling();
    },
    input: function (id, data) {
        switch (id) {
            case "symbol":
                this.symbol = data;
                break;
            case "amount":
                this.amount = data;
                break;
            case "period":
                this.period = data;
                break;
            case "duration":
                this.duration = data;
                return;
            case "frequency":
                this.frequency = data;
                return;
        }

        this.startPolling();
    },
    uninstall() {
        clearInterval(this.intervalID);
    },

    startPolling: function () {
        this.stopPolling();

        this.intervalID = setInterval(() => {
            this.resolveData();
        }, this.intervalTime);

        this.resolveData();
    },
    stopPolling: function () {
        clearInterval(this.intervalID);
    },
    resolveData: async function () {
        if (this.symbol.length == 0) {
            this.stopPolling();
            return;
        }

        const timedelta = (days) => days * 24 * 60 * 60;
        const now = new Date().getTime() / 1000;

        let period;
        let timeStart;

        switch (this.period) {
            case 0:
                period = Math.min(this.amount, 59);
                timeStart = now - timedelta(period);
                break;
            case 1:
                period = Math.min(period, 59);
                timeStart = now - timedelta(period * 7);
                break;
            case 2:
                period = Math.min(period, 59);
                timeStart = now - timedelta(period * 30);
                break;
            case 3:
                period = Math.min(period, 59);
                timeStart = now - timedelta(period * 365);
                break;
        }

        let freqUnit = "m";

        switch (this.frequency) {
            case 1:
                freqUnit = "h";
                break;
            case 2:
                freqUnit = "d";
                break;
            case 3:
                freqUnit = "wk";
                break;
            case 4:
                freqUnit = "mo";
                break;
        }

        const timeEnd = now;
        const interval = this.duration + freqUnit;

        const url = [
            `https://query1.finance.yahoo.com/v8/finance/chart/`,
            this.symbol,
            `?symbol=${this.symbol}`,
            `&period1=${timeStart | 0}&period2=${timeEnd | 0}&interval=${interval}&`,
            `includePrePost=true&events=div%7Csplit%7Cearn&lang=en-US&`,
            `region=US&crumb=t5QZMhgytYZ&corsDomain=finance.yahoo.com`
        ].join('');

        try {
            const response = await fetch(url);
            this.jsonData = await response.json();

            this.buildData();
        } catch (ex) { }
    },
    buildData: function () {
        if (!this.jsonData) {
            return;
        }

        const outputs = this.options.outputs;

        console.log(this.jsonData);
        return;

        /*outputs.open = this.jsonData.;
        outputs.high = this.jsonData.;
        outputs.low = this.jsonData.;
        outputs.close = this.jsonData.;
        outputs.volume = this.jsonData.;*/
    }
}
