module.exports = {
    options: null,
    dimensions: null,
    reAuthDone: false,
    previousCover: "",
    intervalTime: 2000,
    intervalID: null,
    spotifyApi: null,
    thumbList: [],
    coverPath: 'assets/spotify.png',
    previousID: null,
    popup: false,
    wasPlaying: false,
    imageSize: -1,
    progress: 0,
    tween: null,
    killed: false,

    install: function (options) {
        this.options = options;

        this.spotifyApi = options.SpotifyWebApi;

        this.dimensions = this.options.params.canvas;

        this.showLogo();
        this.authSpotify();
    },
    resize: function (bounds) {
        this.dimensions = bounds;

        this.publishCover();
    },
    input(id, data) {
        switch (id) {
            case "Image size":
                this.imageSize = data;

                this.publishCover();
                break;
            case "next":
                this.spotifyApi.skipToNext();
                break;
            case "previous":
                this.spotifyApi.skipToPrevious();
                break;
            case "play":
                if (this.playing) {
                    return;
                }

                this.spotifyApi.play();
                break;
            case "pause":
                if (!this.playing) {
                    return;
                }

                this.spotifyApi.pause();
                break;
        }
    },
    webhook(event) {
        this.input(event.data);
    },
    spotify(event) {
        const refThis = this;

        this.spotifyApi.authorizationCodeGrant(event.data).then(
            function (data) {
                let credentialsRaw = localStorage.getItem("com_unic8_elan_spotify");
                let credentialsData = credentialsRaw ? JSON.parse(credentialsRaw) : { spotify: {} };

                credentialsData["expire"] = data.body['expires_in'];
                credentialsData["accessToken"] = data.body['access_token'];
                credentialsData["refreshToken"] = data.body['refresh_token'];

                localStorage.setItem("com_unic8_elan_spotify", JSON.stringify(credentialsData));

                refThis.spotifyApi.setAccessToken(data.body['access_token']);
                refThis.spotifyApi.setRefreshToken(data.body['refresh_token']);

                refThis.startPolling();

                refThis.popup = false;
            },
            function (err) {
                console.log('Something went wrong!', err);
            }
        );
    },
    uninstall: function () {
        clearInterval(this.intervalID);

        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }

        this.killed = true;
    },

    showLogo() {
        const fileID = this.options.files[this.coverPath];

        this.options.outputs.cover = {
            fileID: fileID,
            path: this.coverPath
        };
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
    publishCover: function () {
        if (this.thumbList.length == 0) {
            return;
        }

        const maxSize = Math.max(this.dimensions.width, this.dimensions.height);
        let sizeIndex = this.imageSize;

        if (sizeIndex <= -1) {
            if (maxSize <= 64) {
                sizeIndex = 2;
            } else if (maxSize <= 300) {
                sizeIndex = 1;
            } else {
                sizeIndex = 0;
            }
        } else if (sizeIndex >= this.thumbList.length) {
            sizeIndex = this.thumbList.length - 1;
        }

        const coverURL = this.thumbList[sizeIndex].url;

        if (this.previousCover != coverURL) {
            this.options.outputs.cover = {
                fileID: coverURL,
                path: coverURL
            };

            this.previousCover = coverURL;
        }
    },
    resolveData: function () {
        const refThis = this;
        const outputs = this.options.outputs;

        this.spotifyApi.getMyCurrentPlaybackState()
            .then(function (data) {
                if (refThis.killed) {
                    return;
                }

                if (data.body) {
                    if (refThis.wasPlaying != data.body.is_playing) {
                        refThis.wasPlaying = data.body.is_playing;

                        outputs.playing = data.body.is_playing;
                    }

                    let itemID = data.body.item ? data.body.item.id : null;

                    if (data.body.is_playing) {
                        const progress = data.body.progress_ms / 1000;

                        if (Math.abs(progress - refThis.progress) > 5) {
                            outputs.progress = refThis.progress = progress;
                        } else {
                            refThis.tween = refThis.options.GSAP.TweenLite.to(refThis, 1.9,
                                {
                                    progress: progress,
                                    ease: refThis.options.GSAP.Linear.easeNone,
                                    onUpdate: () => {
                                        outputs.progress = Number(refThis.progress).toFixed(3);
                                    }
                                }
                            );
                        }

                        if (data.body.item && refThis.previousID != itemID) {
                            refThis.previousID = itemID;

                            outputs.song = data.body.item.name;
                            outputs.album = data.body.item.album.name;
                            outputs.artist = data.body.item.artists[0].name;
                            outputs.duration = data.body.item.duration_ms / 1000;

                            refThis.spotifyApi.getMyCurrentPlayingTrack()
                                .then(function (data) {
                                    if (refThis.killed) {
                                        return;
                                    }

                                    refThis.thumbList = data.body.item.album.images;

                                    refThis.publishCover();
                                }, (error) => {
                                    refThis.handleError(error);
                                });
                        }
                    } else {
                        refThis.resetState();
                    }
                } else {
                    refThis.resetState();
                }
            }, (error) => {
                refThis.handleError(error);
            });
    },
    resetState: function () {
        const itemID = null;
        const outputs = this.options.outputs;

        if (this.previousID != itemID) {
            this.previousID = itemID;

            outputs.progress = 0;
            outputs.song = "";
            outputs.album = "";
            outputs.artist = "";
            outputs.duration = 0;
        }

        if (this.previousCover != this.coverPath) {
            this.showLogo();

            this.previousCover = this.coverPath;
        }
    },
    handleError: function (error) {
        if (!this.reAuthDone && error.statusCode == 401) {
            this.stopPolling();
            this.refreshToken();

            this.reAuthDone = true;
        } else {
            this.authSpotify();

            console.error(error);
        }
    },
    authSpotify: function () {
        if (this.popup) {
            return;
        }

        let credentialsRaw = localStorage.getItem("com_unic8_elan_spotify");
        let credentialsData = credentialsRaw ? JSON.parse(credentialsRaw) : { spotify: {} };

        const accessToken = credentialsData["accessToken"];
        const refreshToken = credentialsData["refreshToken"];

        if (accessToken && refreshToken) {
            const refThis = this;

            this.spotifyApi.setAccessToken(accessToken);
            this.spotifyApi.setRefreshToken(refreshToken);

            this.spotifyApi.refreshAccessToken().then(
                function (data) {
                    refThis.spotifyApi.setAccessToken(data.body['access_token']);

                    let credentialsRaw = localStorage.getItem("com_unic8_elan_spotify");
                    let credentialsData = credentialsRaw ? JSON.parse(credentialsRaw) : { spotify: {} };

                    credentialsData["expire"] = data.body['expires_in'];
                    credentialsData["accessToken"] = data.body['access_token'];

                    localStorage.setItem("com_unic8_elan_spotify", JSON.stringify(credentialsData));

                    refThis.startPolling();
                },
                function (err) {
                    console.log('Could not refresh access token', err);
                }
            );
        } else {
            var scopes = [
                'user-read-playback-state',
                'user-modify-playback-state',
                'user-read-currently-playing'
            ];
            var state = 'some-state-of-my-choice';
            var showDialog = true;

            var authorizeURL = this.spotifyApi.createAuthorizeURL(scopes, state, showDialog);

            window.open(authorizeURL, "Spotify", "toolbar=no, location=no, directories=no, status=no, menubar=no, resizable=no");
            this.popup = true;
        }
    },
    refreshToken: function () {
        const refThis = this;

        this.spotifyApi.refreshAccessToken().then(
            function (data) {
                if (refThis.killed) {
                    return;
                }

                let credentialsRaw = localStorage.getItem("com_unic8_elan_spotify");
                let credentialsData = credentialsRaw ? JSON.parse(credentialsRaw) : { spotify: {} };

                credentialsData["accessToken"] = data.body['access_token'];

                localStorage.setItem("com_unic8_elan_spotify", JSON.stringify(credentialsData));

                if (refThis.spotifyApi) {
                    refThis.spotifyApi.setAccessToken(data.body['access_token']);

                    refThis.startPolling();
                } else {
                    refThis.authSpotify();
                }
            },
            function (err) {
                if (refThis.killed) {
                    return;
                }

                localStorage.removeItem("spotifyExpire");
                localStorage.removeItem("spotifyAccessToken");
                localStorage.removeItem("spotifyRefreshToken");

                refThis.authSpotify();

                console.log('Could not refresh access token', err);
            }
        );
    }
}
