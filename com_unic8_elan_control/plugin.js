module.exports = {
    options: null,

    install: function (options) {
        this.options = options;
    },
    webhook(event) {
        const node = this.options.nodes.outputs.query(event.data);

        if(node){
            node.data = !node.data;
        }
    }
}