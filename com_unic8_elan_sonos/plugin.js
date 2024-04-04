module.exports = {
    options: null,
    timestamp: -1,
    intervalId: null,
    previousCover: null,
    killed: false,
    host: null,

    install: function (options) {
        this.options = options;
    },
    uninstall: function () {
        this.stopPolling();

        this.killed = true;
    },
    input(id, data) {
        switch (id) {
            case "next":
                this.options.SonosHelper.next(this.host);
                break;
            case "previous":
                this.options.SonosHelper.previous(this.host);
                break;
            case "play":
                this.options.SonosHelper.play(this.host);
                break;
            case "pause":
                this.options.SonosHelper.pause(this.host);
                break;
        }
    },
    webhook(event) {
        this.input(event.data);
    },

    stopPolling: function () {
        clearInterval(this.intervalID);
    },

    sonos: function (event) {
        if (this.killed) {
            return;
        }

        switch (event.data.cmd) {
            case "deviceDiscovery":
                this.host = event.data.host;

                var refThis = this;

                this.intervalId = setInterval(() => {
                    refThis.options.SonosHelper.currentTrack(this.host);
                }, 2000);
                break;
            case "currentTrack":
                var track = event.data.track;

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