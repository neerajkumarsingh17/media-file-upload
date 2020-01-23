define(function(require) {

    "use strict";

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        tpl = require('text!tpl/banner.html'),
        nav_model = require('app/models/banner'),
        ResourceModel = require('app/models/resource'),
        ResourceView = require('app/views/resource');

    return Backbone.View.extend({

        id: 'banner',
        $el: null,
        initialize: function() {
            this.$el = $("#" + this.id);
            var self = this;
            self.model = new nav_model();
            // model fetch
            this.listenTo(this.model, 'change', this.render);
            this.model.fetch_all();
        },
        render: function() {
            var self = this;
            if (this.model.attributes.data != undefined) {
                var template = _.template(tpl);
                this.$el.html(template(self.model.attributes));
                return this;
            }
        },
    });
});