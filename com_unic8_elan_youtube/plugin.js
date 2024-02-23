module.exports = {
    options: null,
    dimensions: null,
    appKey: 'AIzaSyCHOF_NybstWKYn_VlT-wMduGQGVshLNEE',
    inputTimeout: null,
    intervalTime: 10000,
    intervalID: null,
    channel: "",
    channelID: null,
    thumbList: [],
    imageSize: 0,
    coverPath: 'assets/youtube.png',
    viewCount: 0,
    subscriberCount: 0,
    videoCount: 0,

    install: function (options) {
        this.options = options;

        this.dimensions = this.options.params.canvas;

        this.showLogo();
        this.startPolling();
    },
    input: function (id, data) {
        switch (id) {
            case "channel":
                this.channel = data;

                if(this.inputTimeout){
                    clearTimeout(this.inputTimeout);
                }

                this.inputTimeout = setTimeout(() => {
                    this.startPolling();
                }, 1000);
                break;
            case "imageSize":
                this.imageSize = data;

                this.publishCover();
                break;
        }
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.publishCover();
    },
    uninstall() {
        clearInterval(this.intervalID);
    },

    startPolling: function () {
        this.stopPolling();

        this.intervalID = setInterval(() => {
            this.resolveDetails();
        }, this.intervalTime);

        this.resolveChannel();
    },
    stopPolling: function () {
        clearInterval(this.intervalID);
    },
    resolveChannel: async function () {
        if (this.channel.length == 0) {
            return;
        }

        const url = [
            'https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=',
            this.channel,
            '&key=',
            this.appKey
        ].join('');

        try {
            const response = await fetch(url);
            const jsonData = await response.json();

            if (jsonData.items && jsonData.items.length > 0) {
                const item = jsonData.items[0];
                const thumbnails = item.snippet.thumbnails;

                this.channelID = item.id.channelId;

                this.thumbList = [
                    thumbnails.default.url,
                    thumbnails.medium.url,
                    thumbnails.high.url
                ];
            }

            this.resolveDetails();
            this.publishCover();
        } catch (ex) { }
    },
    resolveDetails: async function () {
        if (!this.channelID) {
            return;
        }

        const url = [
            'https://www.googleapis.com/youtube/v3/channels?part=statistics&id=',
            this.channelID,
            '&key=',
            this.appKey
        ].join('');

        try {
            const response = await fetch(url);
            const jsonData = await response.json();

            if (jsonData.items && jsonData.items.length > 0) {
                const stats = jsonData.items[0].statistics;

                this.options.nodes.outputs.query("viewCount").data = stats.viewCount;
                this.options.nodes.outputs.query("subscriberCount").data = stats.subscriberCount;
                this.options.nodes.outputs.query("videoCount").data = stats.videoCount;
            }
        } catch (ex) { }
    },
    showLogo() {
        const fileID = this.options.files[this.coverPath];

        this.options.nodes.outputs.query("cover").data = {
            fileID: fileID,
            path: this.coverPath
        };
    },
    publishCover() {
        if (this.thumbList.length == 0) {
            this.showLogo();
            return;
        }

        const maxSize = Math.max(this.dimensions.width, this.dimensions.height);
        let sizeIndex = this.imageSize;

        if (sizeIndex <= -1) {
            if (maxSize <= 64) {
                sizeIndex = 0;
            } else if (maxSize <= 300) {
                sizeIndex = 1;
            } else {
                sizeIndex = 2;
            }
        } else if (sizeIndex >= this.thumbList.length) {
            sizeIndex = this.thumbList.length - 1;
        }

        const coverURL = this.thumbList[sizeIndex];

        if (this.previousCover != coverURL) {
            this.options.nodes.outputs.query("cover").data = {
                fileID: coverURL,
                path: coverURL
            };

            this.previousCover = coverURL;
        }
    }
}