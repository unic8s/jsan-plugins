module.exports = {
    options: null,
    outputs: null,

    install: function (options, inputs, outputs) {
        this.options = options;
        this.outputs = outputs;

        window.addEventListener("keyup", this.onKey.bind(this));
    },
    uninstall: function () {
        window.removeEventListener("keyup", this.onKey);
    },
    webhook(event) {
        const node = this.outputs[event.data];

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

        const node = this.outputs[type];

        if (node) {
            node.data = !node.data;
        }
    }
}