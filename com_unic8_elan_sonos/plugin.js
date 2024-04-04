module.exports = {
    options: null,
    timestamp: -1,
    intervalId: null,
    previousCover: null,
    coverPath: 'assets/sonos.png',
    track: null,
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

        console.log(event.data.cmd, event.data);

        switch (event.data.cmd) {
            case "currentTrack":
                this.track = event.data.track; 
                
                this.generateOutput();
                break;
            case "playState":
                var state = event.data.state;

                switch(state){
                    case "playing":
                        break;
                    case "paused":
                        this.track = null;
                        break;
                }

                this.generateOutput();
                break;
        }
    },
    generateOutput(){
        const fileID = this.options.files[this.coverPath];

        const info = this.track ? this.track : {title: "", artist: "", album: "", progress: 0, duration: 1, albumArtURI: fileID};

        this.options.nodes.outputs.query("song").data = info.title;
        this.options.nodes.outputs.query("artist").data = info.artist;
        this.options.nodes.outputs.query("album").data = info.album;
        this.options.nodes.outputs.query("progress").data = info.position;
        this.options.nodes.outputs.query("duration").data = info.duration;

        if (this.previousCover != info.albumArtURI) {
            this.options.nodes.outputs.query("cover").data = {
                fileID: info.albumArtURI,
                path: info.albumArtURI
            };

            this.previousCover = info.albumArtURI;
        }
    }
}