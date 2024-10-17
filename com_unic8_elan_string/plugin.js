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
            case "Len":
                this.outputs.Len = data.length;
                break;
            case "Has hay":
                this.hasHay = data;
                break;
            case "Has ndl":
                this.hasNdl = data;
                break;
            case "Con A":
                this.conA = data;
                break;
            case "Con B":
                this.conB = data;
                break;
            case "Con sep":
                this.conSep = data;
                break;
            case "Rep hay":
                this.repHay = data;
                break;
            case "Rep ndl":
                this.repNdl = data;
                break;
            case "Rep new":
                this.repNew = data;
                break;
            case "Sub src":
                this.subSrc = data;
                break;
            case "Sub bgn":
                this.subBgn = data;
                break;
            case "Sub end":
                this.subEnd = data;
                break;
        }

        const outputs = this.options.outputs;

        switch (id) {
            case "Has hay":
            case "Has ndl":
                outputs.Has = this.hasHay.indexOf(this.hasNdl) >= 0;
                break;
            case "Con A":
            case "Con B":
            case "Con sep":
                outputs.Con = this.conA + this.conSep + this.conB;
                break;
            case "Rep hay":
            case "Rep ndl":
            case "Rep new":
                var replaced = this.repHay;

                if (this.repNdl.length > 0) {
                    while (replaced.indexOf(this.repNdl) >= 0) {
                        replaced = replaced.replace(this.repNdl, this.repNew);
                    }
                }

                outputs.Rep = replaced;
                break;
            case "Sub src":
            case "Sub bgn":
            case "Sub end":
                var end = this.subEnd == 0 ? this.subSrc.length - 1 : this.subEnd;

                outputs.Sub = this.subSrc.substr(this.subBgn, end);
                break;
        }
    }
}
