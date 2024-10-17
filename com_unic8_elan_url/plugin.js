module.exports = {
    options: null,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        const outputs = this.options.outputs;
        
        switch (id) {
            case "fileA":
                outputs.urlA = data;
                break;
            case "urlB":
                outputs.fileB = {
                    fileID: data,
                    path: data
                };
                break;
        }
    }
}
