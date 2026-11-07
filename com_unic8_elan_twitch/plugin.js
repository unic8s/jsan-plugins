module.exports = {
    options: null,
    clientId: "kimne78kx3ncx6brgo4mv6wki5h1ko",
    channel: null,
    quality: -1,
    inputTimeout: null,
    streams: [],

    install: function (options) {
        this.options = options;
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

        this.getStream(this.channel)
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
    },
    async getAccessToken(id, isVod) {
        const data = JSON.stringify({
            operationName: "PlaybackAccessToken",
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"
                }
            },
            variables: {
                isLive: !isVod,
                login: (isVod ? "" : id),
                isVod: isVod,
                vodID: (isVod ? id : ""),
                playerType: "embed"
            }
        });

        return new Promise((resolve, reject) => {
            fetch("https://gql.twitch.tv/gql", {
                method: "POST",
                body: data,
                headers: {
                    'Client-id': this.clientId
                }
            }).then(async (response) => {
                const body = await response.json();

                if (response.status != 200) {
                    reject(new Error(body.message));
                } else {
                    if (isVod) {
                        resolve(body.data.videoPlaybackAccessToken);
                    } else {
                        resolve(body.data.streamPlaybackAccessToken);
                    }
                }
            });
        });
    },
    getPlaylist(id, accessToken, vod) {
        return new Promise((resolve, reject) => {
            fetch('https://usher.ttvnw.net/' + (vod ? 'vod' : 'api/channel/hls') + '/' + id + '.m3u8?client_id=' + this.clientId + '&token=' + accessToken.value + '&sig=' + accessToken.signature + '&allow_source=true')
                .then(async (response) => {
                    const body = await response.text();

                    switch (response.status) {
                        case 200:
                            resolve(resolve(body));
                            break;
                        case 404:
                            reject(new Error('Transcode does not exist - the stream is probably offline'));
                            break;
                        default:
                            reject(new Error(`Twitch returned status code ${response.statusCode}`));
                            break;
                    }
                });
        });
    },
    parsePlaylist(playlist) {
        const parsedPlaylist = [];
        const lines = playlist.split('\n');
        for (let i = 4; i < lines.length; i += 3) {
            parsedPlaylist.push({
                quality: lines[i - 2].split('NAME="')[1].split('"')[0],
                resolution: (lines[i - 1].indexOf('RESOLUTION') != -1 ? lines[i - 1].split('RESOLUTION=')[1].split(',')[0] : null),
                url: lines[i]
            });
        }
        return parsedPlaylist;
    },
    getStream(channel, raw) {
        return new Promise((resolve, reject) => {
            this.getAccessToken(channel, false)
                .then((accessToken) => this.getPlaylist(channel, accessToken, false))
                .then((playlist) => resolve((raw ? playlist : this.parsePlaylist(playlist))))
                .catch(error => reject(error));
        });
    },
    getVod(vid, raw) {
        return new Promise((resolve, reject) => {
            this.getAccessToken(vid, true)
                .then((accessToken) => this.getPlaylist(vid, accessToken, true))
                .then((playlist) => resolve((raw ? playlist : this.parsePlaylist(playlist))))
                .catch(error => reject(error));
        });
    }
}
