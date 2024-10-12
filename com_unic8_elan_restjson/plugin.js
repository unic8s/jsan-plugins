module.exports = {
    token: "",
    url: "",
    entity: "",
    query: "",
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
            case "query":
                this.query = data;
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

        if (this.query && this.interval > 0) {
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

            const result = this.queryData(data, this.query.split("."));

            this.options.nodes.outputs.query("value").data = result ? result : "";
            this.options.nodes.outputs.query("error").data = result ? "" : body;
        } catch (ex) {
            this.options.nodes.outputs.query("value").data = "";
            this.options.nodes.outputs.query("error").data = ex.toString();
        }
    },
    queryData(data, segments){
        const segment = segments.shift();

        if(data[segment]){
            const fragment = data[segment];

            if(segments.length > 0) {
                data = this.queryData(fragment, segments);
            }else{
                data = fragment;
            }
        }else{
            data = null;
        }

        return data;
    }
}