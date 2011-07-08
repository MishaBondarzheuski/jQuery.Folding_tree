/*
 * JQuery.Folding_tree
 * v2011-07-08
 *
 * Copyleft 2011 Dmitry Latin <dim0xff@gmail.com>
 * http://www.dim0xff.com
 * http://www.dimalatin.ru
 *
 * Licensed under the GPLv2 license
 * http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * Depends on:
 * jquery.ui.widget.js
 *
 */

(function ($) {
    $.widget("dim0xff.folding_tree", {
        VERSION: "2011-07-08",
        options: {
            child_prefix:            "child-of-",
            collapsed_initial_state: true,
            easing_show:             undefined,
            easing_show_time:        "slow",
            easing_hide:             undefined,
            easing_hide_time:        "slow",
            expander_click:          undefined,
            data_click:              undefined,
            expand_parents:          true,
            force_id:                true,
            bindings:                []
        },
        _create: function () {
            var self = this;
            var o    = this.options;
            var el   = this.element;

            for (var idx = 0; idx < o.bindings.length; idx++) {
                o.bindings[idx] = new o.bindings[idx](self);
            }

            self.rebuildTree(el);

            self._trigger("-created", null);
        },
        _getItem: function (item) {
            var self = this;
            var o    = this.options;
            var el   = this.element;


            if (!item) {
                return undefined;
            }

            if (typeof(item) == "string") {
                item = el.find("#" + item);
            }

            if (!item.length) {
                return undefined;
            }

            return item;
        },
        rebuildTree: function (ul, skip_event) {
            var self = this;
            var o    = this.options;
            var el   = this.element;

            var items        = ul.children("li");
            var items_length = items.length;

            for (var idx = 0; idx < items_length; idx++) {
                var item = $(items[idx]);
                self.createItem(item, true);

                var container = item.children("ul.dim0xff-folding_tree-container");
                self.rebuildTree(container, true);
            }
            if (!skip_event) {
                self._trigger("-rebuilded", null);
            }
        },
        createItem: function (item, skip_event) {
            var self = this;
            var o    = this.options;
            var el   = this.element;

            if ( !( item = self._getItem(item) ) ) {
                return;
            }

            /*
             * Already created.
             */
            if ( item.data("folding_tree") && item.data("folding_tree").created) {
                return;
            }

            /*
             * Item should have an id for faster searching.
             * Use option `force_id` TRUE to force creation empty item id.
             */
            if (o.force_id && !item.attr("id")) {
                var d = new Date();
                item.attr( "id", "dim0xff-folding_tree-" + el.attr("id") + "-item-" + d.getTime() + Math.round( Math.random()*1000 ) );
            }

            item.addClass("dim0xff-folding_tree-item");

            /*
             * Last ul item child is a container for item sub items.
             */
            var container   = item.contents().filter("ul:last").remove();
            var data        = item.contents().remove();

            /*
             * Move data to data container (DIV with `dim0xff-folding_tree-item-data` class ).
             */
            var data_container = $("<div />")
                .addClass("dim0xff-folding_tree-item-data")
                .click(function () {
                    if (typeof(o.data_click) == "function") {
                        o.data_click(item);
                    }
                    else {
                        self.select(item);
                    }
                }).appendTo(item);

            data.appendTo(data_container);


            /*
             * If ul container was not found, create it.
             */
            if (!container.length) {
                container = $("<ul />");
            }

            if(!container.hasClass("dim0xff-folding_tree-container")) {
                container.addClass("dim0xff-folding_tree-container");
            }

            if (item.attr("id")) {
                container.attr("id", "dim0xff-folding_tree-" + el.attr("id") + "-container-for-" + item.attr("id"));
            }

            container.appendTo(item);


            /*
             * Create expander
             */
            $("<div />")
                .addClass("dim0xff-folding_tree-expander")
                .click(function () {
                    if (typeof(o.expander_click) == "function") {
                        o.expander_click(item);
                    }
                    else {
                        self.toggle(item);
                    }
                })
                .prependTo(item);

            if (!item.data("folding_tree")) {
                item.data("folding_tree", {created: true});
            }
            else {
                item.data("folding_tree").created = true;
            }

            var item_classes = item.attr("class");

            if (item_classes.match(o.child_prefix)) {
                var classes = item_classes.split(/\s+/);
                var classes_length = classes.length;

                for (var idx = 0; idx < classes_length; idx++) {
                    var item_class = classes[idx];
                    if ( item_class.match(o.child_prefix) ) {
                        var parent_item_id = item_class.replace(o.child_prefix, "");

                        var parent_item_container = $("#dim0xff-folding_tree-" + el.attr("id") + "-container-for-" + parent_item_id)

                        if (parent_item_container.length) {
                            idx = classes_length;
                            item.appendTo(parent_item_container);
                        }
                    }
                }
            }

            if (o.collapsed_initial_state) {
                self.collapse(item, true);
            }
            else {
                self.expand(item, true);
            }

            if (!skip_event) {
                self._trigger("-item_created", null, [item]);
            }
        },
        _hide: function (item) {
            var self = this;
            var o    = this.options;
            var el   = this.element;

            if (o.easing_hide) {
                if (item.is(":hidden")) {
                    item.hide();
                }
                else {
                    item.animate({ height: "hide" }, o.easing_hide_time, o.easing_hide);
                }
            }
            else {
                item.hide();
            }
        },
        _show: function (item) {
            var self = this;
            var o    = this.options;
            var el   = this.element;

            if (o.easing_show) {
                item.animate({ height: "show" }, o.easing_show_time, o.easing_show);
            }
            else {
                item.show();
            }
        },
        toggle: function (item, skip_event) {
            var self = this;
            var el   = this.element;

            if ( !( item = self._getItem(item) ) ) {
                return;
            }

            if (item.hasClass("dim0xff-folding_tree-expanded")) {
                self.collapse(item, skip_event);
            }
            else {
                self.expand(item, skip_event);
            }

            if (!skip_event) {
                self._trigger("-toggled", null, [item]);
            }
        },
        collapse: function (item, skip_event) {
            var self = this;
            var el   = this.element;

            if ( !( item = self._getItem(item) ) ) {
                return;
            }

            var container;
            if (item.attr("id")) {
                container = $("#dim0xff-folding_tree-" + el.attr("id") + "-container-for-" + item.attr("id"));
            }
            else {
                container = item.children("ul.dim0xff-folding_tree-container");
            }

            self._hide(container);
            item.removeClass("dim0xff-folding_tree-expanded").addClass("dim0xff-folding_tree-collapsed");

            if (!skip_event) {
                self._trigger("-collapsed", null, [item]);
            }
        },
        expand: function (item, skip_event) {
            var self = this;
            var o    = this.options;
            var el   = this.element;

            if ( !( item = self._getItem(item) ) ) {
                return;
            }

            if (o.expand_parents) {
                var parent_container = item.parent("ul.dim0xff-folding_tree-container");
                if (parent_container.length) {
                    var parent_item = parent_container.parent("li.dim0xff-folding_tree-item");
                    self.expand(parent_item, true);
                }
            }

            var container;
            if (item.attr("id")) {
                container = $("#dim0xff-folding_tree-" + el.attr("id") + "-container-for-" + item.attr("id"));
            }
            else {
                container = item.children("ul.dim0xff-folding_tree-container");
            }

            self._show(container);
            item.removeClass("dim0xff-folding_tree-collapsed").addClass("dim0xff-folding_tree-expanded");

            if (!skip_event) {
                self._trigger("-expanded", null, [item]);
            }
        },
        select: function (item, skip_event) {
            var self = this;
            var o    = this.options;
            var el   = this.element;

            if ( !( item = self._getItem(item) ) ) {
                return;
            }

            if (item.hasClass("dim0xff-folding_tree-selected")) {
                self.toggle(item);
            }
            else {
                el.find(".dim0xff-folding_tree-selected").removeClass("dim0xff-folding_tree-selected");
                item.addClass("dim0xff-folding_tree-selected");
                if (o.expand_parents || item.hasClass("dim0xff-folding_tree-collapsed")) {
                    self.expand(item);
                }
            }

            if (!skip_event) {
                self._trigger("-selected", null, [item]);
            }
        }
    });
})(jQuery);
