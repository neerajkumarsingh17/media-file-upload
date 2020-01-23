define(function(require) {

    "use strict";

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        tpl = require('text!tpl/left-nav.html'),
        nav_model = require('app/models/left-nav'),
        ResourceModel = require('app/models/resource'),
        ResourceView = require('app/views/resource'),
        modal_dialog = require('app/views/modal_dialog');

    return Backbone.View.extend({

        id: 'left-nav',
        $el: null,
        searchParam: {},
        events: {
            "click .content_partner": "content_partner",
            "click .grade": "grade",
            "click .subject": "subject",
            // "click .close-btn": "close_btn",
        },
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
            // sort content_partner
            var array_content_partner = this.model.attributes.data.content_partner;
            var array_subject = this.model.attributes.data.subject;
            array_content_partner.sort(compare);
            array_subject.sort(compare);
            // compare fun for sorting content_partener, grade and subject
            function compare(a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            }
            //end content_partner
            if (this.model.attributes.data != undefined) {
                self.resource_model = new ResourceModel();
                self.resource_view = new ResourceView({
                    model: self.resource_model,
                });
                var template = _.template(tpl);
                this.$el.html(template(self.model.attributes));

            }

            var cont_ty_arr = []
            for (var i = 0; i < this.model.attributes.data.content_type.length; ++i) {
                var content_type_data = this.model.attributes.data.content_type[i].name;
                cont_ty_arr.push(content_type_data);
            }

            $("#rs_filetype").dxTagBox({
                items: cont_ty_arr,
                searchEnabled: false,
                maxDisplayedTags: 1,
                showDropDownButton: true,
                placeholder: "Content Type...",
                onValueChanged: function(selectedItems) {
                    var data = selectedItems.value;
                    rs_type(data);
                },
            });
            //content type selected function call
            function rs_type(data) {
                self.file_types(self, data);
            }


            $.urlParam = function(name) {
                var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                    .exec(window.location.search);
                return (results !== null) ? results[1] || 0 : false;
            }

            if ($.urlParam("id")) {
                var options = { id: $.urlParam("id") };
                $.ajax({
                    url: '/resources/api/resources_popup/',
                    type: 'GET',
                    dataType: 'json',
                    data: options,
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
                    },
                    success: function(object, status) {
                        if (object && object.length > 0) {
                            var m = new modal_dialog();
                            m.show({ "data": object[0] });
                        }
                    }
                });
            }
        },


        file_types: function(self, data) {
            var search_param = $("#resource-input").val();
            var resource_model = self.resource_model;
            var resource_view = self.resource_view;
            var searchParam = {};
            self.searchParam.file_types = "";
            if (data && data.length > 0)
                self.searchParam.file_types = data.join(",");
            self.searchParam.search_param = search_param;
            self.searchParam.page = 1;
            resource_model.all = true;
            $("#resources_div").html("");

            resource_model.fetch_all(self.searchParam);
        },

        content_partner: function(e) {
            e.preventDefault();
            var targetJQ = $(e.target);
            if ($(targetJQ).hasClass('selected')) {
                // var targetJQ = $(e.target);
                if (e.target.tagName != "SPAN")
                    targetJQ = targetJQ.parents("span:eq(0)");

                targetJQ.removeClass("selected");

                //$("ul li.content_partner.selected").removeClass("selected");
                //this.close_btn(e);
            } else {
                $(e.currentTarget).addClass('selected');
            }
            var search_param = $("#resource-input").val();
            // $("#content_partners").find('li').removeClass('selected');
            // var abc = $(e.delegateTarget).find("selected").attr("data-pk");


            var content_partener_array = [];
            // var content_partner = $(e.target).attr('data-pk');

            var listItems = $("#content_partners span");
            listItems.each(function(id, span) {
                if ($(span).hasClass("selected")) {
                    var content_list = $(span).attr('data-pk');
                    content_partener_array.push(content_list);
                }
            });
            var resource_model = this.resource_model;
            var resource_view = this.resource_view;

            this.searchParam.content_partner = content_partener_array.join(",");
            this.searchParam.search_param = search_param;
            this.searchParam.page = 1;
            $("#resources_div").html("");
            resource_model.all = true;
            resource_model.fetch_all(this.searchParam);
            if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                var source = "mobile";
            } else {
                var source = "web"
            }
            var c_p_data = new Object();
            c_p_data["action"] = 16;
            c_p_data["metadata"] = e.target.innerText.slice(0, -4);
            c_p_data["page"] = "Content Partner";
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
        },

        grade: function(e) {
            e.preventDefault();
            var targetJQ = $(e.target);
            if ($(targetJQ).hasClass('selected')) {
                // var targetJQ = $(e.target);
                if (e.target.tagName != "SPAN")
                    targetJQ = targetJQ.parents("span:eq(0)");

                targetJQ.removeClass("selected");
                // $("ul li.grade.selected").removeClass("selected");
                // this.close_btn(e);
            } else {
                $(e.currentTarget).addClass('selected');
            }
            var search_param = $("#resource-input").val();
            // $("#grades").find('li').removeClass('selected');
            // var grade_list = [];
            // var grade = $(e.target).attr('data-pk');
            // grade_list.append(grade);
            var grades_array = [];


            var listItems = $("#grades span");
            listItems.each(function(id, span) {
                if ($(span).hasClass("selected")) {
                    var grade_list = $(span).attr('data-pk');
                    grades_array.push(grade_list);
                }
            });
            var resource_model = this.resource_model;
            var resource_view = this.resource_view;
            this.searchParam.grade = grades_array.join(',');
            this.searchParam.search_param = search_param;
            this.searchParam.page = 1;
            resource_model.all = true;
            $("#resources_div").html("");
            resource_model.fetch_all(this.searchParam);
            if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                var source = "mobile";
            } else {
                var source = "web"
            }
            var c_p_data = new Object();
            c_p_data["action"] = 16;
            c_p_data["metadata"] = e.target.innerText.split(" ")[0];
            c_p_data["page"] = "Grade";
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
        },

        subject: function(e) {
            e.preventDefault();
            var targetJQ = $(e.target);
            if ($(targetJQ).hasClass('selected')) {
                // var targetJQ = $(e.target);
                if (e.target.tagName != "SPAN")
                    targetJQ = targetJQ.parents("span:eq(0)");

                targetJQ.removeClass("selected");
                // $("ul li.subject.selected").removeClass("selected");
                // this.close_btn(e);
            } else {
                $(e.currentTarget).addClass('selected');
            }

            var search_param = $("#resource-input").val();
            // $("#subjects").find('li').removeClass('selected');
            // $(e.currentTarget).parent('ul').find('li').removeClass('selected');


            var subject = $(e.target).attr('data-pk');

            var subjects_array = [];

            var listItems = $("#subjects span");
            listItems.each(function(id, span) {
                if ($(span).hasClass("selected")) {
                    var subject_list = $(span).attr('data-pk');
                    subjects_array.push(subject_list);
                }
            });

            var resource_model = this.resource_model;
            var resource_view = this.resource_view;
            // resource_model.reset();
            this.searchParam.subject = subjects_array.join(',');
            this.searchParam.search_param = search_param;
            this.searchParam.page = 1;
            $("#resources_div").html("");
            resource_model.all = true;
            resource_model.fetch_all(this.searchParam);
            if (navigator.userAgent.trim().toLowerCase().includes("firki")) {
                var source = "mobile";
            } else {
                var source = "web"
            }
            var c_p_data = new Object();
            c_p_data["action"] = 16;
            c_p_data["metadata"] = e.target.innerText.split(" ")[0];
            c_p_data["page"] = "Subject";
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
        },

        // close_btn: function(e) {
        //     // e.preventDefault();
        //     // e.stopPropagation();
        //     // var el = $(e.currentTarget).parent('span');
        //     // $(e.currentTarget).parent('span').removeClass('selected');

        //     var searchParam = this.searchParam;

        //     if ($("#content_partners").find('span').hasClass('selected')) {
        //         searchParam["content_partner"] = $("#content_partners").find('.selected').attr('data-pk');
        //     }
        //     if ($("#grades").find('span').hasClass('selected')) {
        //         searchParam["grade"] = $("#grades").find('.selected').attr('data-pk');
        //     }
        //     if ($('#subjects').find('span').hasClass('selected')) {
        //         searchParam["subject"] = $("#subjects").find('.selected').attr('data-pk');
        //     }
        //     var search_string = $("#resource-input").val();
        //     var file_types = $("#rs_filetype").val();
        //     if (file_types == "") {
        //         searchParam["file_types"] = undefined;
        //     }

        //     if (search_string == "") {
        //         searchParam["search_string"] = undefined;
        //     }

        //     var resource_model = this.resource_model;
        //     var resource_view = this.resource_view;
        //     if (searchParam["content_partner"] === undefined && searchParam["grade"] === undefined && searchParam["subject"] === undefined && searchParam["file_types"] === undefined) {
        //         resource_model.all = false;
        //         $("#resources_data").hide();
        //         resource_model.fetch_all(searchParam);
        //         // this.model.fetch_all();
        //     } else {
        //         resource_model.fetch_all(searchParam);
        //     }
        // }

    });
});