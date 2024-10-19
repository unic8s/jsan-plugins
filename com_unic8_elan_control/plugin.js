module.exports = {
    options: null,
    map: {
        "ArrowLeft": "left",
        "ArrowUp": "up",
        "ArrowRight": "right",
        "ArrowDown": "down",
        "Escape": "back",
        "Enter": "enter"
    },

    install: function (options) {
        this.options = options;

        window.addEventListener("keyup", this.onKey.bind(this));
    },
    uninstall: function () {
        window.removeEventListener("keyup", this.onKey);
    },
    webhook(event) {
        const type = event.data;
        
        this.options.outputs[type] = !this.options.outputs[type];
    },

    onKey(event) {
        const type = this.map[event.code];

        if(type){
            this.options.outputs[type] = !this.options.outputs[type];
        }
    }
}
