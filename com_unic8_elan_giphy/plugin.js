module.exports = {
    options: null,
    apiKey: '1IIOEdd2okuoCnzL9c93LJSqSpolOuh5',
    inputTimeout: null,
    search: "",
    index: 0,
    jsonData: null,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "search":
                this.search = data;

                if(this.inputTimeout){
                    clearTimeout(this.inputTimeout);
                }

                this.inputTimeout = setTimeout(() => {
                    this.resolveData();
                }, 1000);
                break;
            case "index":
                if(data < 0){
                    data = 0;
                }

                this.index = data;

                this.buildData();
                break;
        }
    },

    resolveData: async function () {
        const url = [
            'https://api.giphy.com/v1/gifs/search?api_key=',
            this.apiKey,
            '&q=',
            this.search
        ].join('');

        try {
            const response = await fetch(url);
            this.jsonData = (await response.json()).data;

            this.buildData();
        } catch (ex) { }
    },
    buildData: function () {
        if (!this.jsonData) {
            return;
        }

        if(this.index > this.jsonData.length - 1){
            this.index = this.jsonData.length - 1;
        }

        let item = this.jsonData[this.index];

        if(!item){
            return;
        }

        this.options.nodes.outputs.query("image").data = {
            fileID: item.images.preview_gif.url,
            path: item.images.preview_gif.url
        };
    }
}