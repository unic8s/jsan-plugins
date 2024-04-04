module.exports = {
    options: null,
    timestamp: -1,
    intervalId: null,
    previousCover: null,
    killed: false,

    install: function (options) {
        this.options = options;
    },
    uninstall: function () {
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

    sonos: function (event) {
        if (this.killed) {
            return;
        }

        switch (event.data.cmd) {
            case "currentTrack":
                var track = event.data.track;

                this.options.nodes.outputs.query("song").data = track.title;
                this.options.nodes.outputs.query("artist").data = track.artist;
                this.options.nodes.outputs.query("album").data = track.album;
                this.options.nodes.outputs.query("song").data = track.title;
                this.options.nodes.outputs.query("progress").data = track.position;
                this.options.nodes.outputs.query("duration").data = track.duration;

                if (this.previousCover != track.albumArtURI) {
                    this.options.nodes.outputs.query("cover").data = {
                        fileID: track.albumArtURI,
                        path: track.albumArtURI
                    };

                    this.previousCover = track.albumArtURI;
                }
                break;
        }
    }
}