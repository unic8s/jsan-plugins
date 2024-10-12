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
    response: function (event) {
        if (event.data.error) {
            this.options.nodes.outputs.query("value").data = "";
            this.options.nodes.outputs.query("error").data = event.data.error;
        } else {
            const body = event.data.response;
            const data = JSON.parse(body);

            const result = this.queryData(data, this.query.split("."));

            this.options.nodes.outputs.query("value").data = result ? result : "";
            this.options.nodes.outputs.query("error").data = result ? "" : body;
        }
    },

    grab: async function () {
        const headers = {
            "Content-Type": "application/json"
        };

        if (this.token.length > 0) {
            headers["Authorization"] = "Bearer " + this.token;
        }

        this.options.webRequest(this.url, { headers });
    },
    queryData(data, segments) {
        const segment = segments.shift();

        if (data[segment]) {
            const fragment = data[segment];

            if (segments.length > 0) {
                data = this.queryData(fragment, segments);
            } else {
                data = fragment;
            }
        } else {
            data = null;
        }

        return data;
    }
}