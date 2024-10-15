module.exports = {
    options: null,
    outputs: null,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;
    },
    input: function (id, data) {
        switch (id) {
            case "fileA":
                this.outputs.urlA = data;
                break;
            case "urlB":
                this.outputs.fileB = {
                    fileID: data,
                    path: data
                };
                break;
        }
    }
}