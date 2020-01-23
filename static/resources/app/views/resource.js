define(function(require) {
    "use strict";

    var $ = require("jquery"),
        _ = require("underscore"),
        Backbone = require("backbone"),
        datatable = require("datatable"),
        tpl = require("text!tpl/resources.html"),
        resource_info_tpl = require("text!tpl/resource_info.html"),
        modal_dialog = require("app/views/modal_dialog");

    return Backbone.View.extend({
        id: "resources_div",
        $el: null,
        form_data: null,
        scrollView: null,
        pageNumber: 0,

        events: {
            "click .page-link": "pagination",
            "click .resource_view": "resource_view",
            "click .resource_download": "resource_download",
            // "click .resource_info_view": "resource_info_view",
            "click .resource_bookmark": "resource_bookmark",
            "click .resource_like": "resource_like",
            "click .resource_share": "resource_share"
        },
        initialize: function() {
            this.$el = $("#" + this.id);
            this.listenTo(this.model, "change", this.render);
            this.model.fetch_all();
            this.right_nav_el = $("#right-nav");
        },

        render: function() {
            var thisObj = this;
            $(".resource_parent_div").addClass("full-width");
            $("#right-nav").hide();
            var template = _.template(tpl);
            try {
                this.model.attributes["page"] = this.model.options["page"];
            } catch (e) {}

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

            if (!this.scrollView) {
                function updateBottomContent(e) {
                    thisObj.pageNumber += 1;
                    if (15 <= thisObj.model.attributes.results.results.length) {
                        $(".dx-scrollview-bottom-pocket").show();
                        thisObj.pagination(thisObj.pageNumber);
                    } else {
                        $(".dx-scrollview-bottom-pocket").hide();
                    }
                }

                this.scrollView = $(".resource_parent_div")
                    .dxScrollView({
                        scrollByContent: true,
                        scrollByThumb: true,
                        useNative: true,
                        bounceEnabled: true,
                        showScrollbar: "Never",
                        onReachBottom: updateBottomContent,
                        reachBottomText: "Updating..."
                    })
                    .dxScrollView("instance");
            }
            this.$el.append(template(this.model.attributes));
            if (thisObj.model.attributes.results.results.length == 0) {
                $(".dx-scrollview-bottom-pocket").hide();
            }
            this.scrollView.release();
            return;
        },

        pagination: function(pageNum) {
            var self = this;
            // var page_url = $(e.currentTarget).attr('data-pk');
            // if (page_url != undefined) {
            // var pageNum = null;
            // if (Number.isInteger(parseInt(page_url))) {
            //     page_number = page_url;
            // } else {
            //     page_number = this.getParameterByName("page", page_url);
            // }
            if (pageNum == 0) {
                pageNum = 1;
            }
            if (self.model.options == undefined) {
                self.model.options = {
                    page: pageNum
                };
            } else {
                self.model.options["page"] = pageNum;
            }
            self.model.fetch_all(self.model.options);
            // }
        },

        getParameterByName: function(name, url) {
            var match = RegExp("[?&]" + name + "=([^&]*)").exec(url);
            return match && decodeURIComponent(match[1].replace(/\+/g, " "));
        },

        getSelectedResourceData: function(resource_id) {
            var resources = this.model.attributes.results.results;
            for (var i = 0; i < resources.length; i++) {
                var resource = resources[i];
                if (resource.id == resource_id) {
                    return resource;
                }
            }
        },
        resource_download: function(e) {
            e.stopPropagation();

            var resource_id = $(e.target)
                .parents()[2]
                .getAttribute("data-pk");
            var resources = this.model.attributes.results.results;
            var resource = resources.filter(resource => {
                return resource.id == resource_id;
            })[0];
            if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                var source = "mobile";
            } else {
                var source = "web"
            }
            var c_p_data = new Object();
            c_p_data["action"] = 18;
            c_p_data["metadata"] = resource.content_partner_name;
            c_p_data["page"] = resource.name;
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
        resource_view: function(e) {
            var resource_id = $(e.currentTarget).attr("data-pk");
            var resource = this.getSelectedResourceData(resource_id);
            var m = new modal_dialog();
            m.show({ data: resource });
            if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                var source = "mobile";
            } else {
                var source = "web"
            }
            var c_p_data = new Object();
            c_p_data["action"] = 19;
            c_p_data["metadata"] = resource.content_partner_name;
            c_p_data["page"] = resource.name;
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
            e.stopPropagation();
            var currentObj = e.currentTarget;
            var parent = $(currentObj).parent();
            var resource_id = $(currentObj).attr("data-pk");
            var resource = this.getSelectedResourceData(resource_id);
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
                    metadata: resource.content_partner_name,
                    page: resource.name,
                    source: source,
                },

                success: function(data) {
                    console.log(data);
                },
                error: function() {
                    console.log("Error in Operation");
                }
            });
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
                data: {
                    content_id: resource_id,
                    rs_type: "R"
                },
                success: function(data) {
                    if (data.is_active) {
                        parent.find(".normal_bm").hide();
                        parent.find(".success_bm").show();
                    } else {
                        parent.find(".success_bm").hide();
                        parent.find(".normal_bm").show();
                    }
                },
                error: function() {
                    console.log("Error in Operation");
                }
            });
        },

        resource_like: function(e) {
            e.stopPropagation();
            var currentObj = e.currentTarget;
            var parent = $(currentObj).parent();
            var resource_id = $(currentObj).attr("data-pk");
            var resource = this.getSelectedResourceData(resource_id);
            var csrftoken = document.cookie
                .split(";")
                .filter(e => {
                    return e.includes("csrf");
                })[0]
                .split("=")[1];
            $.ajax({
                url: "/discourse/setLike/",
                type: "POST",
                headers: {
                    "X-CSRFToken": csrftoken
                },
                data: { content_id: resource_id, rs_type: "R" },
                success: function(data) {
                    if (data.is_active) {
                        parent.find(".normal_lk").hide();
                        parent.find(".success_lk").show();
                    } else {
                        parent.find(".success_lk").hide();
                        parent.find(".normal_lk").show();
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
                            action: 20,
                            metadata: resource.content_partner_name,
                            page: resource.name,
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
        resource_share: function(e) {
            e.stopPropagation();
            var currentObj = e.currentTarget;
            var parent = $(currentObj).parent();
            var resource_id = $(currentObj).attr("data-pk");

            var csrftoken = document.cookie
                .split(";")
                .filter(e => {
                    return e.includes("csrf");
                })[0]
                .split("=")[1];
            $.ajax({
                url: "/discourse/setLike/",
                type: "POST",
                headers: {
                    "X-CSRFToken": csrftoken
                },
                data: { content_id: resource_id, rs_type: "R" },
                success: function(data) {
                    if (data.is_active) {
                        parent.find(".normal_lk").hide();
                        parent.find(".success_lk").show();
                    } else {
                        parent.find(".success_lk").hide();
                        parent.find(".normal_lk").show();
                    }
                },
                error: function() {
                    console.log("Error in Operation");
                }
            });
        }

        // resource_info_view: function(e) {
        //     $(".resource_parent_div").removeClass("full-width");
        //     $("#right-nav").show();

        //     var resource_id = $(e.currentTarget).attr("data-pk");
        //     var resource = this.getSelectedResourceData(resource_id);
        //     var template = _.template(resource_info_tpl);
        //     this.right_nav_el.html(template({ "data": resource }));

        //     return;
        // }
    });
});