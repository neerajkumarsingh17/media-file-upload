define(function(require) {

    "use strict";

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        tpl = require('text!tpl/search-form.html');

    return Backbone.View.extend({

        id: 'search-form',
        $el: null,
        form_data: null,
        events: {
            "submit #search-form": "search",
        },
        initialize: function(left_nav) {
            this.$el = $("#" + this.id);
            this.render();
            this.left_nav = left_nav.left_nav;
        },

        render: function() {
            var template = _.template(tpl);
            return this.$el.html(template());


            // function filter() {
            //     document.getElementById("demo").innerHTML = "Hello World";
            // }
        },

        search: function(e) {
            e.preventDefault();
            var search_param = $("#resource-input").val();
            var resource_model = this.left_nav.resource_model;
            var resource_view = this.left_nav.resource_view;
            if (resource_model.options == undefined) {
                resource_model.options = {
                    "search_param": search_param,
                    "page": 1,
                }
            } else {
                resource_model.options['search_param'] = search_param;
            }
            $("#resources_div").html("");

            resource_model.fetch_all(resource_model.options);
            if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                var source = "mobile";
            } else {
                var source = "web"
            }
            var c_p_data = new Object();
            c_p_data["action"] = 16;
            c_p_data["metadata"] = search_param;
            c_p_data["page"] = "Resourse Search";
            c_p_data["source"] = source;
            var csrftoken = document.cookie.split(";")
                .filter(e => { return e.includes("csrf"); })[0].split("=")[1];
            $.ajax({
                url: '/discourse/saveDataToAnalytics/',
                type: 'GET',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: c_p_data,
                success: function(data, textStatus, xhr) {
                    console.log(data);
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.log('Error in Operation');
                }
            });

        }
    });
});