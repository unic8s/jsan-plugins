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

        const SpotifyWebApi = options.SpotifyWebApi;

        this.spotifyApi = new SpotifyWebApi({
            clientId: '7e51b167651046ee98c97391d5b5aece',
            clientSecret: 'c96b0d8e8ece4d41a4f8885e9fd093d6',
            redirectUri: 'http://localhost:8888/spotify/callback'
        });

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
                this.spotifyApi.skipToNext()
                    .then(function () {
                    }, function (err) {
                        console.log('Something went wrong!', err);
                    });
                break;
            case "previous":
                this.spotifyApi.skipToPrevious()
                    .then(function () {
                    }, function (err) {
                        console.log('Something went wrong!', err);
                    });
                break;
            case "play":
                this.spotifyApi.play()
                    .then(function () {
                    }, function (err) {
                        console.log('Something went wrong!', err);
                    });
                break;
            case "pause":
                this.spotifyApi.pause()
                    .then(function () {
                    }, function (err) {
                        console.log('Something went wrong!', err);
                    });
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
                localStorage.setItem("spotifyExpire", data.body['expires_in']);
                localStorage.setItem("spotifyAccessToken", data.body['access_token']);
                localStorage.setItem("spotifyRefreshToken", data.body['refresh_token']);

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

        this.options.nodes.outputs.query("cover").data = {
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
        clearInterval(this.options.intervalID);
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
            this.options.nodes.outputs.query("cover").data = {
                fileID: coverURL,
                path: coverURL
            };

            this.previousCover = coverURL;
        }
    },
    resolveData: function () {
        const refThis = this;

        this.spotifyApi.getMyCurrentPlaybackState()
            .then(function (data) {
                if (refThis.killed) {
                    return;
                }

                if (data.body) {
                    if (refThis.wasPlaying != data.body.is_playing) {
                        refThis.wasPlaying = data.body.is_playing;

                        refThis.options.nodes.outputs.query("playing").data = data.body.is_playing;
                    }

                    let itemID = data.body.item ? data.body.item.id : null;

                    if (data.body.is_playing) {
                        const progress = data.body.progress_ms / 1000;

                        if (Math.abs(progress - refThis.progress) > 5) {
                            refThis.options.nodes.outputs.query("progress").data = refThis.progress = progress;
                        } else {
                            refThis.tween = window.TweenLite.to(refThis, 1.9,
                                {
                                    progress: progress,
                                    ease: window.Linear.easeNone,
                                    roundProps: {
                                        progress: 0.001
                                    },
                                    onUpdate: () => {
                                        refThis.options.nodes.outputs.query("progress").data = refThis.progress;
                                    }
                                }
                            );
                        }

                        if (data.body.item && refThis.previousID != itemID) {
                            refThis.previousID = itemID;

                            refThis.options.nodes.outputs.query("song").data = data.body.item.name;
                            refThis.options.nodes.outputs.query("album").data = data.body.item.album.name;
                            refThis.options.nodes.outputs.query("artist").data = data.body.item.artists[0].name;
                            refThis.options.nodes.outputs.query("duration").data = data.body.item.duration_ms / 1000;

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

        if (this.previousID != itemID) {
            this.previousID = itemID;

            this.options.nodes.outputs.query("progress").data = 0;
            this.options.nodes.outputs.query("song").data = "";
            this.options.nodes.outputs.query("album").data = "";
            this.options.nodes.outputs.query("artist").data = "";
            this.options.nodes.outputs.query("duration").data = 0;
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

        const accessToken = localStorage.getItem("spotifyAccessToken");
        const refreshToken = localStorage.getItem("spotifyRefreshToken");

        if (accessToken && refreshToken) {
            this.spotifyApi.setAccessToken(accessToken);
            this.spotifyApi.setRefreshToken(refreshToken);

            this.startPolling();
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

                localStorage.setItem("spotifyAccessToken", data.body['access_token']);

                if (refThis.spotifyApi) {
                    refThis.spotifyApi.setAccessToken(data.body['access_token']);
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