module.exports = {
    options: null,
    dimensions: null,
    list: null,
    interval: null,
    intervalID: null,
    index: 0,
    files: [],

    install: function (options) {
        this.options = options;

        this.list = options.inputs.list;
        this.interval = options.inputs.interval;

        this.getFiles();
    },
    input: function (id, data) {
        switch (id) {
            case "list":
                this.list = data;

                this.getFiles();
                break;
            case "index":
                this.index = data;

                if (this.index < 0) {
                    this.index = 0;
                } else if (this.index > data.length - 1) {
                    this.index = data.length - 1;
                }

                this.updateFile();
                break;
            case "interval":
                this.interval = data;
                break;
            case "trigger":
                if (this.index < this.files.length - 1) {
                    this.index++;
                } else {
                    this.index = 0;
                }

                this.updateFile();
                break;
        }

        this.startTimer();
    },
    uninstall: function () {
        this.stopTimer();
    },

    startTimer: function () {
        this.stopTimer();

        if (this.interval > 0) {
            this.intervalID = setInterval(() => {
                this.nextFile();
            }, this.interval * 1000);
        }
    },
    stopTimer: function () {
        clearInterval(this.intervalID);
    },
    getFiles: async function () {
        if (!this.list || this.list == "") {
            return;
        }

        const outputs = this.options.outputs;

        outputs.index = this.index = 0;

        try {
            const response = await fetch(this.list);
            this.files = await response.json();

            outputs.amount = this.files.length;

            this.updateFile();
            this.startTimer();
        } catch (ex) { }
    },
    nextFile: function () {
        if (this.index < this.files.length - 1) {
            this.index++;
        } else {
            this.index = 0;
        }

        this.updateFile();
    },
    updateFile: function () {
        const outputs = this.options.outputs;
        
        outputs.index = this.index;

        if (this.files.length > 0) {
            outputs.file = this.files[this.index];
        }
    }
}
