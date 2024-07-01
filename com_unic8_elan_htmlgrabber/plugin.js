module.exports = {
    url: "",
    interval: 10,
    selector: "",
    intervalID: null,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "URL":
                this.url = data;
                break;
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

        if (this.selector) {
            const refThis = this;

            this.intervalID = setInterval(() => {
                refThis.grab();
            }, this.interval * 1000);
        }
    },

    grab: async function () {
        try {
            const response = await fetch(this.url);
            const body = await response.text();
            const myDOM = new DOMParser().parseFromString(body, "text/html");
            const myElement = myDOM.querySelector(this.selector);

            if (myElement) {
                let data = "";

                switch(myElement.nodeName){
                    case "IMG":
                        data = myElement.src;
                        break;
                    case "A":
                        data = myElement.href;
                        break;
                    default:
                        data = myElement.innerText;
                }

                this.options.nodes.outputs.query("Content").data = data;
            }
        } catch (ex) { }
    }
}