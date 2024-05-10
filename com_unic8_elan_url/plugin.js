module.exports = {
    options: null,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "file A":
                this.options.nodes.outputs.query("url A").data = data;
                break;
            case "url B":
                this.options.nodes.outputs.query("file B").data = {
                    fileID: data,
                    path: data
                };
                break;
        }
    }
}