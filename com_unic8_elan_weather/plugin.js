module.exports = {
    options: null,
    outputs: null,
    appID: '6426bd9b96736f6bab6469bf72afa05c',
    intervalTime: 10000,
    intervalID: null,
    location: null,
    unit: null,
    precision: null,
    jsonData: null,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;

        this.location = inputs.location;
        this.unit = inputs.unit;
        this.precision = inputs.precision;

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

        this.outputs.temp_cur = this.jsonData.main.temp.toFixed(this.precision);
        this.outputs.temp_min = this.jsonData.main.temp_min.toFixed(this.precision);
        this.outputs.temp_max = this.jsonData.main.temp_max.toFixed(this.precision);
        this.outputs.humidity = this.jsonData.main.humidity;
        this.outputs.sunrise = this.jsonData.sys.sunrise;
        this.outputs.sunset = this.jsonData.sys.sunset;
        this.outputs.icon = {
            fileID: iconURL,
            path: iconURL
        };
    }
}