module.exports = {
    options: null,
    twitchApi: null,
    channel: null,
    quality: -1,
    inputTimeout: null,
    streams: [],

    install: function (options) {
        this.options = options;

        this.twitchApi = options.TwitchApi;
    },
    input: function (id, data) {
        switch (id) {
            case "channel":
                this.channel = data;

                if (this.inputTimeout) {
                    clearTimeout(this.inputTimeout);
                }

                this.inputTimeout = setTimeout(() => {
                    this.resolveData();
                }, 1000);
                break;
            case "quality":
                if (data < -1) {
                    data = -1;
                }

                this.quality = data;

                this.buildData();
                break;
        }
    },

    resolveData: async function () {
        const refThis = this;

        this.twitchApi.getStream(this.channel)
            .then((data) => {
                refThis.streams = data;

                this.buildData();
            })
            .catch(err => console.error(err));
    },
    buildData: function () {
        if (this.streams.length == 0) {
            return;
        }

        if (this.quality > this.streams.length - 1) {
            this.quality = this.streams.length - 1;
        }

        let item = this.streams[this.quality];

        if (!item) {
            return;
        }

        this.options.outputs.stream = {
            fileID: item.url,
            path: item.url
        };
    }
}
