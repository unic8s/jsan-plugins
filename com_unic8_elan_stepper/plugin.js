module.exports = {
    options: null,
    from: 0,
    to: 1,
    duration: 1,
    value: 0,
    repeat: false,
    yoyo: false,
    tween: null,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        let needsUpdate = false;

        switch (id) {
            case "trigger":
                this.step(this.from, this.to);
                break;
            case "from":
                this.from = data;

                needsUpdate = true;
                break;
            case "to":
                this.to = data;

                needsUpdate = true;
                break;
            case "duration":
                this.duration = data > 0 ? data : 0.01;
                break;
            case "repeat":
                this.repeat = data;
                break;
            case "yoyo":
                this.yoyo = data;
                break;
        }

        if (needsUpdate && this.outputs.active) {
            this.step(this.from, this.to);
        }
    },
    uninstall: function () {
        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }
    },

    step(from, to) {
        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }

        this.value = from;
        this.outputs.active = true;

        const refThis = this;
        const outputs = this.options.outputs;

        this.tween = this.options.GSAP.TweenLite.to(this, this.duration,
            {
                value: to,
                ease: this.options.GSAP.Linear.easeNone,
                onUpdate: () => {
                    outputs.value = this.value;
                },
                onComplete: () => {
                    if (refThis.repeat) {
                        if (refThis.yoyo) {
                            this.step(to, from);
                        } else {
                            this.step(from, to);
                        }
                    } else {
                        outputs.active = false;
                    }
                }
            }
        );
    }
}
