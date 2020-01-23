define(function(require) {
    "use strict";

    var $ = require("jquery"),
        _ = require("underscore"),
        Backbone = require("backbone"),
        tpl = require("text!tpl/resource_info_modal.html"),
        bootstrap = require("bootstrap"),
        template = _.template(tpl);

    var data_link = {};

    return Backbone.View.extend({
        id: "base-modal",
        $el: null,
        className: "modal fade",

        events: {
            "click .close-btn": "close",
            "click .social_link": "social_link",
            "click .resource_bookmark": "resource_bookmark",
            "click .resource_download": "resource_download"
        },

        initialize: function() {
            // this.$el = $("#" + this.id);
            _.bindAll(this, "show", "render", "renderView");
            bootstrap;
        },

        show: function(resource) {
            $("#base-modal").remove();
            this.$el.modal("show");
            this.render(resource);
        },

        render: function(resource) {
            data_link = resource.data;
            var htmlBlock = this.$el.html(template(resource));
            var currentObj = this;
            if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                var source = "mobile";
            } else {
                var source = "web"
            }
            var csrftoken = document.cookie
                .split(";")
                .filter(e => {
                    return e.includes("csrf");
                })[0]
                .split("=")[1];
            $.ajax({
                url: "/discourse/bookmarkSet/",
                type: "GET",
                headers: {
                    "X-CSRFToken": csrftoken
                },
                data: { content_id: data_link.id, rs_type: "R" },
                success: function(data) {
                    if (data.bookmark) {
                        currentObj.$el.find(".normal_bm").hide();
                        currentObj.$el.find(".success_bm").show();
                    } else {
                        currentObj.$el.find(".success_bm").hide();
                        currentObj.$el.find(".normal_bm").show();
                    }
                },
                error: function() {
                    console.log("Error in Operation");
                }
            });
            setTimeout(function() {
                try {
                    $(".addthis_button_compact").each(function(i, s) {
                        addthis.button(s, null, {
                            url: window.location.origin +
                                "/resources/?id=" +
                                $(s).attr("data-pk")
                        });
                    });
                } catch (ex) {}
            }, 200);
            return htmlBlock;
        },
        social_link: function(e) {
            if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                var source = "mobile";
            } else {
                var source = "web"
            }
            var c_p_data = new Object();
            c_p_data["action"] = 17;
            c_p_data["metadata"] = data_link.name;
            c_p_data["page"] = data_link.content_partner_name;
            c_p_data["source"] = source;
            var csrftoken = document.cookie
                .split(";")
                .filter(e => {
                    return e.includes("csrf");
                })[0]
                .split("=")[1];
            $.ajax({
                url: "/discourse/saveDataToAnalytics/",
                type: "GET",
                headers: {
                    "X-CSRFToken": csrftoken
                },
                data: c_p_data,
                success: function(data) {
                    console.log(data);
                },
                error: function() {
                    console.log("Error in Operation");
                }
            });
        },
        resource_bookmark: function(e) {
            var currentObj = e.currentTarget;
            var parent = $(currentObj).parent();
            // var resource_id = $(currentObj).attr("data-pk");
            var resource_id = data_link.id;
            var csrftoken = document.cookie
                .split(";")
                .filter(e => {
                    return e.includes("csrf");
                })[0]
                .split("=")[1];
            $.ajax({
                url: "/discourse/setBookMark/",
                type: "POST",
                headers: {
                    "X-CSRFToken": csrftoken
                },
                data: { content_id: resource_id, rs_type: "R" },
                success: function(data) {
                    if (data.is_active) {
                        parent.find(".normal_bm").hide();
                        parent.find(".success_bm").show();
                    } else {
                        parent.find(".success_bm").hide();
                        parent.find(".normal_bm").show();
                    }
                    // saving data to analytics
                    if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                        var source = "mobile";
                    } else {
                        var source = "web"
                    }
                    $.ajax({
                        url: "/discourse/saveDataToAnalytics/",
                        type: "GET",
                        headers: {
                            "X-CSRFToken": csrftoken
                        },
                        data: {
                            action: 21,
                            metadata: data_link.content_partner_name,
                            page: data_link.name,
                            source: source,
                        },

                        success: function(data) {
                            console.log(data);
                        },
                        error: function() {
                            console.log("Error in Operation");
                        }
                    });
                },
                error: function() {
                    console.log("Error in Operation");
                }
            });
        },
        resource_download: function(e) {
            e.stopPropagation();
            if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                var source = "mobile";
            } else {
                var source = "web"
            }

            var csrftoken = document.cookie
                .split(";")
                .filter(e => {
                    return e.includes("csrf");
                })[0]
                .split("=")[1];
            $.ajax({
                url: "/discourse/saveDataToAnalytics/",
                type: "GET",
                headers: {
                    "X-CSRFToken": csrftoken
                },
                data: {
                    action: 18,
                    metadata: data_link.content_partner_name,
                    page: data_link.name,
                    source: source,
                },
                success: function(data) {
                    console.log(data);
                },
                error: function() {
                    console.log("Error in Operation");
                }
            });
        },
        renderView: function(template) {
            this.$el.html(template());
        },

        close: function() {
            this.$el.remove();
            $(".modal-backdrop").hide();
        }
    });
});