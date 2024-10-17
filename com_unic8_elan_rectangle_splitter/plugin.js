module.exports = {
    options: null,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        const outputs = this.options.outputs;
        
        outputs.x = data.x;
        outputs.y = data.y;
        outputs.width = data.width;
        outputs.height = data.height;
    }
}
