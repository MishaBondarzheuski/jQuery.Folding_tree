var ajax_binding = (function () {
    function ajax_binding (ft) {
        return this.init(ft);
    }

    ajax_binding.prototype = {
        constructor: ajax_binding, 
        o: {}, 
        _init: function (ft) {
            this.o = {
                self: this, 
                ft:  ft, 
                el:  ft.element, 
                o:   ft.options,  
                o_o: $.extend({}, ft.options)
            };

            if (!this.o.o_o.ajax_binding) {
                this.o.o_o.ajax_binding = {};
            }

            if (!this.o.o_o.ajax_binding.ajax_url) {
                this.o.o_o.ajax_binding.ajax_url = "/";
            }
            
            if (!this.o.o_o.ajax_binding.ajax_data) {
                this.o.o_o.ajax_binding.ajax_data = {};
            }
        }, 
        init: function (ft) {
            this._init(ft);

            var self    = this.o.self;
            var that    = self.o.ft;
            var el      = that.element;
            var o       = that.options;
            var o_o     = self.o.o_o;

            o.data_click = function (i) {
                self.toggle_item_view(i, "select");

                if (typeof(o_o.data_click) == "function") {
                    o_o.data_click(i);
                }
            }

            o.expander_click = function (i) {
                self.toggle_item_view(i, "toggle");

                if (typeof(o_o.expander_click) == "function") {
                    o_o.expander_click(i);
                }
            }

            el.bind("folding_tree-created", function () { self.created() } );
        }, 
        created: function () {
            var self    = this.o.self;
            var that    = self.o.ft;
            var el      = that.element;
            var o       = that.options;
            var o_o     = self.o.o_o;

            self.load_json();
        }, 
        /*
         *
         * toggle_item_view: expand/collapse/select item
         */
        toggle_item_view: function (item, method) {
            var self    = this.o.self;
            var that    = self.o.ft;
            var el      = that.element;
            var o       = that.options;
            var o_o     = self.o.o_o;

            if (item.data("folding_tree").loading) {
                return;
            }

            if (!item.data("folding_tree").loaded) {
                self.load_json(item, method);
            }
            else {
                el.folding_tree(method, item);
            }
        }, 
        /*
         *
         * create_element creating item
         */
        create_element: function (item) {
            var self    = this.o.self;
            var that    = self.o.ft;
            var el      = that.element;
            var o       = that.options;
            var o_o     = self.o.o_o;

            var $li = $("<li />")
                .attr("id", "dim0xff-folding_tree-" + el.attr("id") + "-item-" + item.id)
                .data("folding_tree", {
                    item:    item, 
                    loaded:  false,     // are item children already loaded?
                    loading: false      // is children loading in progress?
                })
                .html(item.name);

            if (item.parent_id) {
                $li.addClass(o_o.child_prefix + "dim0xff-folding_tree-" + el.attr("id") + "-item-" + item.parent_id);
            }

            return $li;
        }, 
        /*
         *
         * load_json - ajax data loading. Returns jsXHR object
         */
        load_json: function (item, method) {
            var self    = this.o.self;
            var that    = self.o.ft;
            var el      = that.element;
            var o       = that.options;
            var o_o     = self.o.o_o;

            var ajax_url  = o_o.ajax_binding.ajax_url;
            var ajax_data = $.extend({}, o_o.ajax_binding.ajax_data);

            if (item) {
                item.data("folding_tree").loading = true;
                item.find(".dim0xff-folding_tree-expander").addClass("loader");

                ajax_data.item_path = item.data("folding_tree").item.path;
            }

            return $.ajax({
                url:        ajax_url, // "/cgi-bin/ls_items.pl",
                data:       ajax_data,
                type:       "POST",
                dataType:   "json",
                success: function (data) {
                    if (data.status == "success") {
                        var data_items_length = data.items.length;

                        for (var idx = 0; idx < data_items_length; idx++) {
                            var data_item = data.items[idx];

                            var $li = self.create_element(data_item);

                            $li.appendTo(el);
                            that.createItem($li);
                        }

                        if (item) {
                            item.data("folding_tree").loaded = true;

                            if (method) {
                                el.folding_tree(method, item);
                            }
                        }
                    }
                },
                complete: function () {
                    if (item) {
                        item.data("folding_tree").loading = false;
                        item.find(".dim0xff-folding_tree-expander").removeClass("loader");
                    }
                }
            });
        }
    };

    return ajax_binding;
})();
