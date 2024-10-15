module.exports = {
    options: null,
    outputs: null,
    timestamp: -1,
    intervalId: null,
    previousCover: null,
    coverPath: 'assets/sonos.png',
    track: null,
    state: "paused",
    killed: false,
    intervalTime: 2000,
    intervalID: null,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;
    },
    uninstall: function () {
        clearInterval(this.intervalID);

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

    startPolling: function () {
        this.stopPolling();

        this.intervalID = setInterval(() => {
            this.options.SonosHelper.currentTrack();
        }, this.intervalTime);

        this.options.SonosHelper.currentTrack();
    },
    stopPolling: function () {
        clearInterval(this.intervalID);

        this.intervalID = null;
    },
    sonos: function (event) {
        if (this.killed) {
            return;
        }

        switch (event.data.cmd) {
            case "currentTrack":
                this.track = event.data.track; 
                
                this.generateOutput();
                break;
            case "playState":
                this.state = event.data.state;

                this.generateOutput();
                break;
        }
    },
    generateOutput(){
        let info = null;

        switch(this.state){
            case "playing":
                info = this.track;

                this.outputs.playing = true;

                if(!this.intervalID){
                    this.startPolling();
                }
                break;
            case "paused":
                var fileID = this.options.files[this.coverPath];

                info = {title: "", artist: "", album: "", progress: 0, duration: 1, albumArtURI: fileID};

                this.outputs.playing = false;

                this.stopPolling();
                break;
        }

        if(!info){
            return;
        }

        this.outputs.song = info.title;
        this.outputs.artist = info.artist;
        this.outputs.album = info.album;
        this.outputs.progress = info.position ? info.position : 0;
        this.outputs.duration = info.duration;

        if (this.previousCover != info.albumArtURI) {
            this.outputs.cover = {
                fileID: info.albumArtURI,
                path: info.albumArtURI
            };

            this.previousCover = info.albumArtURI;
        }
    }
}