define(function(require) {

    "use strict";

    var $ = require('jquery'),
        cookie = require('cookie'),
        Backbone = require('backbone');

    return Backbone.Model.extend({
        url: "/resources/api/summary/",
        fetch_all: function(options) {
            var model = this;
            $.ajax({
                url: '/resources/api/summary/',
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
            this.set("data", results);
        },
    });

});