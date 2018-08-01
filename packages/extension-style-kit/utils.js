import cssEscape from "css.escape";

const HTML_TAGS = [
    "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi",
    "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code",
    "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog",
    "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer",
    "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr",
    "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend",
    "li", "link", "main", "map", "mark", "math", "menu", "menuitem", "meta", "meter",
    "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param",
    "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script",
    "section", "select", "slot", "small", "source", "source", "span", "strong", "style",
    "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea",
    "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"
];

function isHtmlTag(str) {
    return HTML_TAGS.indexOf(str.toLowerCase()) > -1;
}

const NOT_INHERITED_PROPS = [
    "-webkit-background-clip",
    "background-clip",
    "-webkit-text-fill-color"
];

function isPropInherited(prop) {
    return !NOT_INHERITED_PROPS.includes(prop);
}

function blendColors(colors) {
    return colors.reduce(function (blendedColor, color) {
        return blendedColor.blend(color);
    });
}

function escape(str) {
    var escapedStr = str.trim()
        .replace(/[^\s\w-]/g, "")
        .replace(/^(-?\d+)+/, "")
        .replace(/\s+/g, "-");

    if (cssEscape) {
        escapedStr = cssEscape(escapedStr);
    }

    return escapedStr;
}

function selectorize(str) {
    if (!str) {
        return "";
    }

    var selectorizedStr = str.trim();

    if (isHtmlTag(selectorizedStr)) {
        return selectorizedStr.toLowerCase();
    }

    if (/^[#.]/.test(selectorizedStr)) {
        var name = escape(selectorizedStr.substr(1));

        if (name) {
            return selectorizedStr[0] + name;
        }
    }

    selectorizedStr = escape(selectorizedStr);
    return selectorizedStr && `.${selectorizedStr}`;
}

function webkit(Prop) {
    return class {
        constructor(...args) {
            this.instance = new Prop(...args);
        }

        get name() {
            return `-webkit-${this.instance.name}`;
        }

        equals(other) {
            return this.instance.equals(other.instance || other);
        }

        getValue(params) {
            return this.instance.getValue(params);
        }
    };
}

function getPropValue(value, variables, params) {
    const styleValue = value.toStyleValue(params);

    if (!variables) {
        return styleValue;
    }

    const varName = Object.keys(variables).find(
        name => styleValue === variables[name].toStyleValue(params)
    );

    return varName ? varName : styleValue;
}

function getUniqueLayerTextStyles(layer) {
    const uniqueTextStyles = [];

    layer.textStyles.forEach(({ textStyle }) => {
        const found = uniqueTextStyles.some(function (ts) {
            return textStyle.equals(ts);
        });

        if (found) {
            return;
        }

        uniqueTextStyles.push(textStyle);
    });

    return uniqueTextStyles;
}

export {
    blendColors,
    getPropValue,
    getUniqueLayerTextStyles,
    isHtmlTag,
    isPropInherited,
    selectorize,
    webkit
};