module.exports = {
    options: null,
    hasHay: "",
    hasNdl: "",
    conA: "",
    conB: "",
    conSep: "",
    repHay: "",
    repNdl: "",
    repNew: "",
    subSrc: "",
    subBgn: 0,
    subEnd: 0,

    install: function (options) {
        this.options = options;
    },
    input: function (id, data) {
        switch (id) {
            case "hasHay":
                this.hasHay = data;
                break;
            case "hasNdl":
                this.hasNdl = data;
                break;
            case "conA":
                this.conA = data;
                break;
            case "conB":
                this.conB = data;
                break;
            case "conSep":
                this.conSep = data;
                break;
            case "repHay":
                this.repHay = data;
                break;
            case "repNdl":
                this.repNdl = data;
                break;
            case "repNew":
                this.repNew = data;
                break;
            case "subSrc":
                this.subSrc = data;
                break;
            case "subBgn":
                this.subBgn = data;
                break;
            case "subEnd":
                this.subEnd = data;
                break;
        }

        const outputs = this.options.outputs;

        switch (id) {
            case "Len":
                outputs.Len = data.length;
                break;
            case "hasHay":
            case "hasNdl":
                outputs.Has = this.hasHay.indexOf(this.hasNdl) >= 0;
                break;
            case "conA":
            case "conB":
            case "conSep":
                outputs.Con = this.conA + this.conSep + this.conB;
                break;
            case "repHay":
            case "repNdl":
            case "repNew":
                var replaced = this.repHay;

                if (this.repNdl.length > 0) {
                    while (replaced.indexOf(this.repNdl) >= 0) {
                        replaced = replaced.replace(this.repNdl, this.repNew);
                    }
                }

                outputs.Rep = replaced;
                break;
            case "subSrc":
            case "subBgn":
            case "subEnd":
                var end = this.subEnd == 0 ? this.subSrc.length - 1 : this.subEnd;

                outputs.Sub = this.subSrc.substr(this.subBgn, end);
                break;
        }
    }
}
