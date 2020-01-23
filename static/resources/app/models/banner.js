define(function(require) {

    "use strict";

    var $ = require('jquery'),
        cookie = require('cookie'),
        Backbone = require('backbone');

    return Backbone.Model.extend({
        url: "/resources/api/banner/",
        fetch_all: function(options) {
            var model = this;
            $.ajax({
                url: '/resources/api/banner/',
                type: 'GET',
                dataType: 'json',
                data: model.toJSON(),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
                },
                success: function(object, status) {
                    model._reqComplete(object);
                }
            });
        },
        _reqComplete: function(results) {
            if (results.count == 0) {
                $('#banner_not_found').html("");
            } else {
                $('#banner_not_found').html("");
            }
            this.set("data", results);
        },
    });

});