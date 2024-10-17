module.exports = {
    options: null,
    url: "",
    interval: 10,
    selector: "",
    intervalID: null,
    killed: false,

    install: function (options) {
        this.options = options;
    },
    uninstall: function () {
        clearInterval(this.intervalID);

        this.killed = true;
    },
    input: function (id, data) {
        switch (id) {
            case "URL":
                this.url = data;
                break;
            case "Trigger":
                this.grab();
                return;
            case "Interval":
                this.interval = data;
                break;
            case "Selector":
                this.selector = data;
                break;
        }

        if (this.intervalID) {
            clearInterval(this.intervalID);
        }

        if (this.selector && this.interval > 0) {
            const refThis = this;

            this.intervalID = setInterval(() => {
                refThis.grab();
            }, this.interval * 1000);
        }
    },

    grab: async function () {
        try {
            const response = await fetch(this.url);

            if(this.killed){
                return;
            }

            const body = await response.text();
            const myDOM = new DOMParser().parseFromString(body, "text/html");
            const myElement = myDOM.querySelector(this.selector);

            if (myElement) {
                let data = "";

                switch (myElement.nodeName) {
                    case "IMG":
                    case "VIDEO":
                    case "AUDIO":
                        data = myElement.src;
                        break;
                    default:
                        data = myElement.innerText;
                }

                this.outputs.Content = data;
            }
        } catch (ex) {
            this.options.outputs.Content = ex.toString();
        }
    }
}
