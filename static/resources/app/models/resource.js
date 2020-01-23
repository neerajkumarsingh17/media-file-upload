define(function(require) {

    "use strict";

    var $ = require('jquery'),
        cookie = require('cookie'),
        Backbone = require('backbone');

    return Backbone.Model.extend({
        url: "/search/course_discovery/",
        fetch_all: function(options) {
            this.loader();
            var model = this;
            if (typeof(options) === typeof(undefined)) {
                options = {
                    "page_size": 15
                }
            } else {
                options["page_size"] = 15;
            }
            model.options = options;

            $.ajax({
                url: '/resources/api/content/',
                type: 'GET',
                dataType: 'json',
                data: options,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
                },
                success: function(object, status) {
                    model._reqComplete(object);
                }
            });
        },
        _reqComplete: function(results) {
            this.set("results", results);
            //If data not found then user understanding message
            if (results.pagination.count == 0) {
                $('#data_not_found_msg').html("<div style='color:#63c2ce;text-align: -webkit-center;'>Did not match any Resourses.</div>");
            } else {
                $('#data_not_found_msg').html("");
            }
        },
        loader: function() {
            // $('#resources_div').html('<div class="net-loader"></div>');
        }
    });

});