module.exports = {
    options: null,
    freqMin: 0,
    freqMax: 128,
    sensitivity: 10,
    lastLevel: 0,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "freqMin":
                this.freqMin = data;
                break;
            case "freqMax":
                this.freqMax = data;
                break;
            case "sensitivity":
                this.sensitivity = data;
                break;
        }
    },
    microphoneFrequencies: function (event) {
        this.processAudio(event.data);
    },

    processAudio: function (freqData) {
        let audioLevel = 0;

        for (let c = this.freqMin; c < this.freqMax; c++) {
            audioLevel += freqData[c];
        }

        audioLevel /= (this.freqMax - this.freqMin);

        const outputs = this.options.outputs;

        outputs.level = audioLevel | 0;

        if (audioLevel - this.sensitivity > this.lastLevel) {
            outputs.trigger = !outputs.trigger;
        }

        this.lastLevel = audioLevel;
    }
}
