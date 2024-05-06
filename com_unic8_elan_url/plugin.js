module.exports = {
    options: null,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "file":
                this.options.nodes.outputs.query("url").data = data;
                break;
        }
    }
}