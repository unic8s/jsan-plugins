module.exports = {
    options: null,

    install: function (options) {
        this.options = options;

        window.addEventListener("keyup", this.onKey.bind(this));
    },
    uninstall: function () {
        window.removeEventListener("keyup", this.onKey);
    },
    webhook(event) {
        const node = this.options.nodes.outputs.query(event.data);

        if (node) {
            node.data = !node.data;
        }
    },

    onKey(event) {
        let type = null;

        switch (event.code) {
            case "ArrowLeft":
                type = "left";
                break;
            case "ArrowUp":
                type = "up";
                break;
            case "ArrowRight":
                type = "right";
                break;
            case "ArrowDown":
                type = "down";
                break;
            case "Escape":
                type = "back";
                break;
            case "Enter":
                type = "enter";
                break;
            default:
                return;
        }

        const node = this.options.nodes.outputs.query(type);

        if (node) {
            node.data = !node.data;
        }
    }
}