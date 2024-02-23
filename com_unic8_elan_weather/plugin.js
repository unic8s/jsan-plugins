module.exports = {
    options: null,
    appID: '6426bd9b96736f6bab6469bf72afa05c',
    intervalTime: 10000,
    intervalID: null,
    location: null,
    unit: null,
    precision: null,
    jsonData: null,

    install: function (options) {
        this.options = options;

        this.location = options.nodes.inputs.query("location").data;
        this.unit = options.nodes.inputs.query("unit").data;
        this.precision = options.nodes.inputs.query("precision").data;

        this.startPolling();
    },
    input: function (id, data) {
        switch (id) {
            case "location":
                this.location = data;
                break;
            case "unit":
                this.unit = data;
                break;
            case "precision":
                this.precision = data;

                this.buildData();
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
        if (this.location.length == 0) {
            this.stopPolling();
            return;
        }

        const url = [
            'http://api.openweathermap.org/data/2.5/weather?q=',
            this.location,
            '&units=',
            this.unit,
            '&mode=json&appid=',
            this.appID
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

        const iconURL = 'https://openweathermap.org/img/wn/' + this.jsonData.weather[0].icon + '.png';

        this.options.nodes.outputs.query("temp_cur").data = this.jsonData.main.temp.toFixed(this.precision);
        this.options.nodes.outputs.query("temp_min").data = this.jsonData.main.temp_min.toFixed(this.precision);
        this.options.nodes.outputs.query("temp_max").data = this.jsonData.main.temp_max.toFixed(this.precision);
        this.options.nodes.outputs.query("humidity").data = this.jsonData.main.humidity;
        this.options.nodes.outputs.query("sunrise").data = this.jsonData.sys.sunrise;
        this.options.nodes.outputs.query("sunset").data = this.jsonData.sys.sunset;
        this.options.nodes.outputs.query("icon").data = {
            fileID: iconURL,
            path: iconURL
        };
    }
}