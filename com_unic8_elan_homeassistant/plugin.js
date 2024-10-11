module.exports = {
    token: "",
    url: "",
    entity: "",
    selector: "",
    interval: 10,
    intervalID: null,

    install: function (options) {
        this.options = options;
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
            const response = await fetch(this.url + "/api/" + this.entity, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.token
                }
            });
            const body = await response.text();
            const data = JSON.parse(body);

            this.options.nodes.outputs.query("value").data = this.selectData(data, this.selector.split("."));
        } catch (ex) {
            this.options.nodes.outputs.query("value").data = ex.toString();
        }
    },
    selectData(data, segments){
        const segment = segments.shift();

        if(data[segment]){
            const fragment = data[segment];

            if(segments.length > 0) {
                return this.selectData(fragment, segments);
            }else{
                data = fragment;
            }
        }

        return data;
    }
}