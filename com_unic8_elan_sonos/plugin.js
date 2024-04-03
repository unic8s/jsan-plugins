module.exports = {
    options: null,
    timestamp: -1,
    intervalId: null,
    previousCover: null,

    install: function (options) {
        this.options = options;
    },
    uninstall: function () {
        this.stopPolling();
    },

    stopPolling: function () {
        clearInterval(this.intervalID);
    },

    sonos: function (event) {
        switch (event.data.cmd) {
            case "deviceDiscovery":
                const host = event.data.host;
                const refThis = this;

                this.intervalId = setInterval(() => {
                    refThis.options.SonosHelper.currentTrack(host);
                }, 2000);
                break;
            case "currentTrack":
                const track = event.data.track;

                this.options.nodes.outputs.query("song").data = track.title;
                this.options.nodes.outputs.query("artist").data = track.artist;
                this.options.nodes.outputs.query("album").data = track.album;
                this.options.nodes.outputs.query("song").data = track.title;
                this.options.nodes.outputs.query("progress").data = track.position;
                this.options.nodes.outputs.query("duration").data = track.duration;

                if (this.previousCover != track.albumArtURL) {
                    this.options.nodes.outputs.query("cover").data = {
                        fileID: track.albumArtURL,
                        path: track.albumArtURL
                    };

                    this.previousCover = track.albumArtURL;
                }
                break;
        }
    }
}