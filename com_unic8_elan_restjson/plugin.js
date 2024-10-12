module.exports = {
    token: "",
    url: "",
    entity: "",
    selector: "",
    interval: 0,
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
            case "token":
                this.token = data;
                break;
            case "url":
                this.url = data;
                break;
            case "selector":
                this.selector = data;
                break;
            case "trigger":
                this.grab();
                return;
            case "interval":
                this.interval = data;
                break;
            case "entity":
                this.entity = data;
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
            const headers = {
                "Content-Type": "application/json"
            };

            if(this.token.length > 0){
                headers["Authorization"] = "Bearer " + this.token;
            }

            const response = await fetch(this.url, headers);

            if(this.killed){
                return;
            }

            const body = await response.text();
            const data = JSON.parse(body);

            const selection = this.selectData(data, this.selector.split("."));

            this.options.nodes.outputs.query("value").data = selection ? selection : "";
            this.options.nodes.outputs.query("error").data = selection ? "" : body;
        } catch (ex) {
            this.options.nodes.outputs.query("value").data = "";
            this.options.nodes.outputs.query("error").data = ex.toString();
        }
    },
    selectData(data, segments){
        const segment = segments.shift();

        if(data[segment]){
            const fragment = data[segment];

            if(segments.length > 0) {
                data = this.selectData(fragment, segments);
            }else{
                data = fragment;
            }
        }else{
            data = null;
        }

        return data;
    }
}