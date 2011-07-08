var template_binding = (function () {
    function p (ft) {
        return this.init(ft);
    }

    p.prototype = {
        constructor: p, 
        o: {}, 
        _init: function (ft) {
            this.o = {
                self: this, 
                ft: ft, 
                el:   ft.element, 
                o:    ft.options,  
                o_o:  $.extend({}, ft.options)
            };
        }, 
        init: function (ft) {
            this._init(ft);

            var self    = this.o.self;
            var that    = self.o.ft;
            var el      = that.element;
            var o       = that.options;
            var o_o     = self.o.o_o;

            alert("[template_binding] initialization");

            o.data_click = function (i) {
                alert("[template_binding] data_click")

                if (typeof(o_o.data_click) == "function") {
                    o_o.data_click(i);
                }
                else {
                    that.select(i);
                }
            }

            o.expander_click = function (i) {
                alert("[template_binding] expander_click")

                if (typeof(o_o.expander_click) == "function") {
                    o_o.expander_click(i);
                }
                else {
                    that.toggle(i);
                }
            }

            el.bind("folding_tree-created", this.created);
        }, 
        created: function () {
            alert("[template_binding] created");
        }
    };

    return p;
})();
