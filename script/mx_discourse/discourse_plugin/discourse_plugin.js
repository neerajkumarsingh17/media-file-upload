var groupName;

function DiscourseConfig(config) {
    var old_discussions_data = [];
    var configData = config;

    if (configData.groupName) {
        groupName = configData.groupName;
        document.cookie = groupName;
    } else {
        var n = document.cookie.split(" ");
        groupName = n[n.length - 3].split(';')[0];
    }

    configData.initilize = function() {
        $(".resource-file-icon").hide();
        if (!configData.height || configData.height == "")
            configData.height = "600px";

        $(configData.selector).append(
            "<div class='discussions'></div><div class='templates' style='display:none;'></div>"
        );
        $(configData.selector + " .templates").append(
            "<script type='text/tempate' class='discussion_thread'></script>"
        );
        $(configData.selector + " .templates").append(
            "<script type='text/tempate' class='discussion_box'></script>"
        );

        $(configData.selector + " .discussions").load(
            "/static/mx_discourse/discourse_plugin/index.html",
            function() {
                $(configData.selector + " #post_discussions").css(
                    "height",
                    configData.height
                );

                $(configData.selector + " .sendMessageBox").click(function(event) {
                    configData.post_comment(event);
                });
            }
        );
        $(configData.selector + " .discussion_thread").load(
            "/static/mx_discourse/discourse_plugin/single_post.underscore"
        );
        $(configData.selector + " .discussion_box").load(
            "/static/mx_discourse/discourse_plugin/comment_box.underscore"
        );
        if (!configData.topicID) {
            configData
                .getTopicId(configData.source_id, configData.source_type)
                .then(function(s) {
                    window.discussionTopicID = s.data;
                    configData.topicID = s.data;
                    configData.loadDiscussion();
                });
        } else {
            window.discussionTopicID = configData.topicID;
            configData.loadDiscussion();
        }
        setInterval(configData.loadDiscussion, 60000);
    };

    configData.getTopicId = function(source_id, source_type) {
        var defferred = $.Deferred();

        var data = {
            source_id: source_id,
            source_type: source_type
        };
        $.ajax({
            url: "/discourse/getContentTopicId/",
            type: "POST", //send it through get method
            data: data,
            success: function(s) {
                defferred.resolve(s);
            }
        });

        return defferred.promise();
    };

    configData.loadDiscussion = function(
        reply_to_post_number = null,
        parent_div_id = null
    ) {
        if (!configData.topicID) {
            return;
        }

        data = {
            topic_id: parseInt(configData.topicID),
            reply_to_post_number: reply_to_post_number
        };
        $.ajax({
            type: "GET",
            url: "/discourse/get_topic_details/",
            data: data,
            success: function(response) {
                var discussion_post = response.data;
                // code to update the existing discussions data based on polling
                if (old_discussions_data.length) {
                    if (old_discussions_data.length !== discussion_post.length) {
                        // create a new object as a new post found
                        if (!document.getElementById(
                                discussion_post.slice(-1)[0].id + "_post"
                            ))
                            configData.create_single_post_html(
                                discussion_post.slice(-1)[0],
                                parent_div_id
                            );
                        old_discussions_data = response.data;
                    }
                    old_discussions_data.forEach(post => {
                        var new_post = discussion_post.filter(newPost => {
                            return newPost.id === post.id;
                        })[0];
                        if (post.reply_count !== new_post.reply_count) {
                            if (post.reply_count !== 0) {
                                // update the previous count if availbale
                                document
                                    .getElementById(`${post.id}_replycount`)
                                    .innerText.replace(
                                        new RegExp("[0-9]+", "gmi"),
                                        new_post.reply_count
                                    );
                            } else {
                                // create the new count element as it is not available
                                document.getElementById(
                                    `${post.id}_reply`
                                ).parentElement.previousElementSibling.innerHTML = `<a href="javascript:void(0)" id="${new_post.id}_replycount" style="font-size: 0.8rem;">see 1 replies</a>`;
                            }
                            $(
                                configData.selector +
                                " #post_discussions #" +
                                new_post.id +
                                "_replycount"
                            ).click(function() {
                                configData.getPostReplies(new_post.post_number, new_post.id);
                            });
                        }
                    });
                } else {
                    for (var i = 0; i < discussion_post.length; i++) {
                        configData.create_single_post_html(
                            discussion_post[i],
                            parent_div_id
                        );
                    }
                }
                old_discussions_data = response.data;
                //scroll down in messaging show last message 
                setTimeout(function() {
                    $('.chat-over').scrollTop($('.chat-over')[0].scrollHeight);
                }, 1000);
                // $('.generatedcontent').animate({ scrollTop: '0px' }, );
                //add comment box blink focus 
                $('#post_message').focus();
                //remove blink in comment box
                $('#post_message').keypress(function() {
                    $('#newpost').remove();
                });
            }
        });
    };

    configData.create_single_post_html = function(
        discussion_post,
        parent_div_id
    ) {
        var postDetail = {};
        if (parent_div_id) {
            var replied_to_element = document.getElementById(parent_div_id + "_post")
                .firstElementChild.firstElementChild;
            var parent_author = replied_to_element.getElementsByClassName(
                "post-author"
            )[0].innerText;
            var parent_message = replied_to_element.getElementsByClassName(
                "post-message"
            )[0].innerText;
            var parent_author_avatar = replied_to_element
                .getElementsByTagName("img")[0]
                .getAttribute("src");
            postDetail.parentPost = {
                parent_author,
                parent_message,
                parent_author_avatar
            };
        }
        postDetail.post = discussion_post;
        postDetail.post_id = discussion_post["id"];
        postDetail.message = discussion_post["cooked"];
        postDetail.date = discussion_post["created_at"];
        postDetail.sender = discussion_post["username"];
        var action_summary = discussion_post["actions_summary"];
        postDetail.postLike = configData.get_post_likeInfo(
            postDetail.post_id,
            action_summary
        );
        postDetail.reply_count = discussion_post["reply_count"];
        postDetail.avatar_template = discussion_post["avatar_template"].replace(
            "{size}",
            "80"
        );
        postDetail.post_number = discussion_post["post_number"];
        postDetail.configData = configData;
        var template = $(configData.selector + " .discussion_thread").html();
        var html = _.template(template)({ model: postDetail });

        if (parent_div_id)
            $(configData.selector + " #" + parent_div_id + "_postchildren").append(
                html
            );
        else $(configData.selector + " #post_discussions").append(html);
        $(
            configData.selector +
            " #post_discussions #" +
            postDetail.post_id +
            "_replycount"
        ).click(function() {
            configData.getPostReplies(postDetail.post_number, postDetail.post_id);
        });

        $(
            configData.selector +
            " #post_discussions #" +
            postDetail.post_id +
            "_reply"
        ).click(function() {
            configData.displayReplyCmtBox(postDetail.post_id, postDetail.post_number);
        });
        $(
            configData.selector +
            " #post_discussions #" +
            postDetail.post_id +
            "post_like"
        ).click(function() {
            configData.like_post(postDetail.post_id);
        });
    };

    configData.displayReplyCmtBox = function(parentThreadID, post_number) {
        // display  cmtBox htmlthen
        var parent_div_id = parentThreadID + "_post";
        model = {
            post_id: parentThreadID,
            post_no: post_number
        };

        if (parentThreadID) {
            var postChildrenObj = $(
                configData.selector + " #" + parentThreadID + "_replyBoxMain"
            );
            postChildrenObj.toggle();
            if (postChildrenObj.length > 0) return;
        }

        var template = $(configData.selector + " .discussion_box").html();
        var html = _.template(template)({ model: model });
        $(html).insertAfter(
            configData.selector +
            " #" +
            parent_div_id +
            " ." +
            parentThreadID +
            "_message-box"
        );

        $(configData.selector + " #" + parentThreadID + "_replyPost").click(
            function(event) {
                configData.replyPost(parentThreadID, post_number, event);
            }
        );
        $(".cmntarea textarea").on("keyup", function(e) {
            if (e.keyCode === 13 || e.keyCode === 8) {
                e.target.style.height = "1px";
                e.target.style.height = 5 + e.target.scrollHeight + "px";
            }
        });
    };

    configData.getPostReplies = function(reply_to_post_number, parent_div_id) {
        if (parent_div_id) {
            var postChildrenObj = $(
                configData.selector + " #" + parent_div_id + "_postchildren"
            );
            postChildrenObj.toggle();
            if (postChildrenObj.find("div").length > 0) return;
        }

        configData.loadDiscussion(reply_to_post_number, parent_div_id);
    };

    configData.post_comment = function(event) {
        event.preventDefault();
        // $('.cmntarea').html("");
        if ($(".typeappend").attr('href')) {
            var file_type_ex = $(".typeappend").attr('href').match(/\.[0-9a-z]+$/i)[0]
        }
        if ((file_type_ex === '.jpg') || (file_type_ex === '.gif') || (file_type_ex === ".png") || (file_type_ex === ".jpeg")) {
            var message = "<img src='" + $(".typeappend").attr('href') + "'>" + "<p>" + $(configData.selector + " #post_message").text(); + "</p>";
        } else if ((file_type_ex === ".webm") || (file_type_ex === ".mp4") || (file_type_ex === ".mkv")) {
            var message = $(configData.selector + " .cmntarea").find("a").attr('href') + "\n\r" + $(configData.selector + " #post_message").text();
        } else if ((file_type_ex === ".doc") || (file_type_ex === ".docx") || (file_type_ex === ".dot") || (file_type_ex === ".dotx") || (file_type_ex === ".pdf")) {
            var message = $(configData.selector + " .cmntarea").find(".file_append").html();
            message = message + $(configData.selector + " #post_message").text();
        } else {
            var message = $.trim($(configData.selector + " #post_message").text());
        }
        $('#post_message').html("");
        $('.cmntarea').find("a").remove();
        if (message.length < 5) {
            DevExpress.ui.notify("Minimum of 5 characters allowed");
            return;
        }
        if (message == "") return;
        data = {
            raw: message,
            topic_id: configData.topicID,
            archetype: "regular",
            source_id: configData.source_id,
            source_type: configData.source_type
        };
        $.ajax({
            url: "/discourse/create_topicpost/",
            type: "get", //send it through get method
            data: data,
            success: function(response) {
                // var postData = $.parseJSON(response.data);

                if (response.status == "200") {
                    configData.topicID = response.data.topic_id;
                    window.discussionTopicID = response.data.topic_id;
                    var postData = response.data;
                    configData.create_single_post_html(postData);
                } else {
                    DevExpress.ui.notify(response.data.errors[0]);
                }
                setTimeout(function() {
                    $('.chat-over').scrollTop($('.chat-over')[0].scrollHeight);
                }, 100);
            },
            error: function(response) {
                DevExpress.ui.notify(response);
            }
        });
        $(configData.selector + " #post_message").val("");
    };

    configData.replyPost = function(post_id, reply_to_post, event) {
        event.preventDefault();
        var textarea_id = "#" + post_id + "replypost";
        var message = $.trim($(textarea_id).val());
        if (message.length < 5) {
            DevExpress.ui.notify("Minimum of 5 characters allowed");
            return;
        }
        if (message == "") return;

        data = {
            raw: message,
            topic_id: configData.topicID,
            reply_to_post_number: reply_to_post,
            archetype: "regular",
            source_id: configData.source_id,
            source_type: configData.source_type
        };
        $.ajax({
            url: "/discourse/create_topicpost/",
            type: "get", //send it through get method
            data: data,
            success: function(response) {
                var postData = response.data;
                if (response.status == "200") {
                    configData.create_single_post_html(postData, post_id);
                    $(configData.selector + " #" + post_id + "_replyBoxMain").toggle();
                    $(configData.selector + " #" + post_id + "_postchildren").toggle();
                } else {
                    DevExpress.ui.notify(response.data.errors);
                }
            },
            error: function(xhr) {
                DevExpress.ui.notify(response.data.errors);
            }
        });
        $(textarea_id).val("");
    };

    configData.get_post_likeInfo = function(post_id, action_summary) {
        var likeInfo = { count: 0, can_like: false, is_liked: false };
        for (var j = 0; j < action_summary.length; j++) {
            var action_id = action_summary[j]["id"];
            var can_act = action_summary[j]["can_act"];
            var acted = action_summary[j]["acted"];

            if (action_id != 2) continue;

            var count_totlalikes1 = action_summary[j]["count"];
            if (count_totlalikes1) {
                likeInfo.count = count_totlalikes1;
            }

            if (can_act) {
                likeInfo.can_like = can_act;
            }
            if (acted) {
                likeInfo.is_liked = acted;
            }
        }
        return likeInfo;
    };
    configData.like_post = function(post_id) {
        $.get("/webinars/discussion_post_like/" + post_id + "/", function(
            response
        ) {
            if (response == 200) {
                var jqlike = post_id + "post_like";
                var like_element = document.getElementById(jqlike);
                if (like_element) {
                    $('#' + jqlike).removeClass('fa fa-heart-o')
                    $('#' + jqlike).addClass('fa fa-heart')
                    like_element.style.color = "#f05c4e";
                    var count_element = document.getElementById(post_id);
                    if (count_element) {
                        count = parseInt(count_element.innerHTML) + 1;
                        count_element.innerHTML = parseInt(count_element.innerHTML) + 1;
                    }
                }

                // var jqdislike = $("#" + post_id + "_post_dislike");
                // increase count by one when user liked the post
                var jqcount = $("#" + post_id + "_post_count");
            } else {
                //todo
            }
        });
    };
    return configData;
}
// for file icon popup hide 
$("body").click(
    function(e) {
        if (e.target.className !== "attachment-icon") {
            $(".resource-file-icon").hide();
        }
        if (e.target.className === "modal-container") {
            $('.fontface').removeClass('windowScroll');
        }

    }
);
var grade_data = [];
var subject_data;

function attach_file() {
    this.event.preventDefault();
    $('.modal-container').show();
    $('#post_message').blur();
    $('.fontface').addClass('windowScroll');
    $('.modal-container').load('/resourse_filetype/file/', function(response, status, xhr) {
        if (status === "success") {
            $('.resource-file-icon').hide();
            $(this).modal('show');
            grade_data = [];
            subject_data = '';
            // $('.upload-btn').prop('disabled', true)
        }
    });
}

function attach_video() {
    this.event.preventDefault();
    $('#post_message').blur();
    $('.modal-container').show();
    $('.fontface').addClass('windowScroll');
    $('.modal-container').load('/resourse_filetype/video/', function(response, status, xhr) {
        if (status === "success") {
            $('.resource-file-icon').hide();
            $(this).modal('show');
            grade_data = [];
            subject_data = "";
            // $('.upload-btn').prop('disabled', true)
        }
    });
}

function attach_picture() {
    this.event.preventDefault();
    $('#post_message').blur();
    $('.modal-container').show();
    $('.fontface').addClass('windowScroll');
    $('.modal-container').load('/resourse_filetype', function(response, status, xhr) {
        if (status === "success") {
            $('.resource-file-icon').hide();
            $(this).modal('show');
            grade_data = [];
            subject_data = "";
            // $('.upload-btn').prop('disabled', true)
        }
    });
}

function resFile() {
    this.event.preventDefault();
    $('#error_name').html("");
    $('.upload-btn').button('reset');
    let name = document.getElementById('create_re_file');
    let fileName = name.files.item(0).name;
    let file_type = fileName.match(/\.[0-9a-z]+$/i)[0]
    $('#error_file').html("");
    if ((file_type === ".jpg") || (file_type === ".gif") || (file_type === ".png") || (file_type === ".jpeg")) {
        $(".filetype").html(fileName);
        $("#resource_name").val(fileName);
    } else if ((file_type === ".doc") || (file_type === ".docx") || (file_type === ".dot") || (file_type === ".dotx") || (file_type === ".pdf")) {
        $(".filetype").html(fileName);
        $("#resource_name").val(fileName);
    } else if ((file_type === ".mp4") || (file_type === ".webm") || (file_type === ".mkv")) {
        $(".filetype").html(fileName);
        $("#resource_name").val(fileName);
    } else {
        $('#error_file').html('You have uploaded an invalid ' + file_type + ' file type.');
        return
    }

}

function attach_file_icon() { //(url, title, w, h)
    this.event.preventDefault();
    $('.resource-file-icon').toggle();
}

function close_btn() {
    this.event.preventDefault();
    $('.modal-container').hide();
    $('.fontface').removeClass('windowScroll');
}

function grade_tagtype() {
    this.event.preventDefault();
    $('#error_grade').html(" ");
    $('.upload-btn').button('reset');
    grade_data = [];
    var targetJQ = $(event.currentTarget);
    if ($(targetJQ).hasClass('active')) {
        event.preventDefault();
        targetJQ.removeClass("active");
    } else {
        $(event.currentTarget).addClass('active');
    }

    var listItems = $("#grades_type span");
    listItems.each(function(id, span) {
        if ($(span).hasClass("active")) {
            var grade_list = $(span).attr('data-pk');
            grade_data.push(grade_list);
        }
    });
};

function subject_tagtype() {
    this.event.preventDefault();
    $('#error_subject').html("")
    $('.upload-btn').button('reset');
    var targetJQ = $(event.currentTarget);
    if ($(targetJQ).hasClass('active')) {
        event.preventDefault();
        targetJQ.removeClass("active");
    } else {
        $(targetJQ).parent().find(".active").removeClass("active")
        $(event.currentTarget).addClass('active');
    }
    subject_data = $('span.subject_tagtype').attr('data-pk');
};


function Upload_File() {
    this.event.preventDefault();
    var hasError = false;
    if (!subject_data) {
        $('#error_subject').html("<div style='color:#f00;'>Select Subject.</div>");
        hasError = true;
    } else if (grade_data.length == 0) {
        $('#error_grade').html("<div style='color:#f00;'>Select grade.</div>");
        hasError = true;
    } else {
        $('#error_grade').html("");
        $('#error_subject').html("");
        hasError = false;
    }
    let file = $("#create_re_file")[0].files[0];
    if (!file) {
        $('#error_file').html("<div style='color:#f00;'>Please Upload file.</div>");
        hasError = true;
    } else {
        $('#error_file').html(" ")
    }
    let name = $("#resource_name").val();
    if (!name) {
        $('#error_name').html("<div style='color:#f00;'>Please fill name.</div>");
        hasError = true;
    } else {
        $('#error_name').html(" ")
    }
    let subject = $("#subject").val();
    let content_partner = "Teach For India";
    let file_type = $("#filetype").val();

    if (hasError)
        return 0;
    $('.upload-btn').button('loading');
    let fd = new FormData();
    fd.append("file", file);
    fd.append("name", name)
    fd.append("subject", subject_data);
    fd.append("content_partner", content_partner);
    fd.append("file_type", file_type);
    fd.append("grade", grade_data);
    $.ajax({
        method: 'POST',
        url: "/resources/upload/",
        data: fd,
        contentType: false,
        processData: false,
        success: function(data) {
            $('.fontface').removeClass('windowScroll');
            $("#newpost").hide();
            var icon_type = data.file.match(/\.[0-9a-z]+$/i)[0]
            if ((icon_type === ".jpg") || (icon_type === ".gif") || (icon_type === ".png") || (icon_type === ".jpeg")) {
                $('.cmntarea').prepend("<a contenteditable='false' class='typeappend' id='pic_type' href=" + data.file + " target='_blank'><img src='/static/mx_discourse/discourse_plugin/images/image_icon.png'>" + data.name + "<button id='fileClose_btn' onclick='fileClose()'></button></a>");
            } else if ((icon_type === ".doc") || (icon_type === ".docx") || (icon_type === ".dot") || (icon_type === ".dotx") || (icon_type === ".pdf")) {
                $('.cmntarea').prepend("<div class = 'file_append'><a contenteditable='false' class='typeappend' id='file_type' href=" + data.file + " target='_blank'><img src='/static/mx_discourse/discourse_plugin/images/certificate.png'>" + data.name + "<button id='fileClose_btn' onclick='fileClose()'></button></a></div>");
            } else if ((icon_type === ".mp4") || (icon_type === ".webm") || (icon_type === ".mkv")) {
                $('.cmntarea').prepend("<a contenteditable='false' class='typeappend' id='video_type' href=" + data.file + " target='_blank'><img src='/static/mx_discourse/discourse_plugin/images/video_library.png'>" + data.name + "<button id='fileClose_btn' onclick='fileClose()'></button></a>");
            }
            $('#post_message').focus();
            $('.upload-btn').button('reset');
            $('.modal-container').hide();
            $('.resource-file-icon').hide();

            //ajax api call save resource id and group name
            var res_id = data.id;
            var group_name = groupName;
            $.ajax({
                method: 'POST',
                url: "/resourse_filetype/discussion_group/",
                data: { 'resource': res_id, "group_name": group_name },
                success: function(data) {
                    $('#post_message').focus();
                    $('.fontface').removeClass('windowScroll');
                    $('.resource-file-icon').hide();
                    console.log(data)
                    $('.upload-btn').button('reset');

                },
                error: function(error) {
                    $('#post_message').focus();
                    $('.fontface').removeClass('windowScroll');
                    $('.resource-file-icon').hide();
                    console.log(error)
                    $('.upload-btn').button('reset');

                }
            });
        },
        error: function(error) {
            $('#post_message').focus();
            $('.fontface').removeClass('windowScroll');
            $('.resource-file-icon').hide();
            $('.upload-btn').button('reset');
            $('#post_message').append('error');
            $('.modal-container').hide();

        }
    });
}


function fileClose() {
    this.event.preventDefault();
    $('#' + $('#fileClose_btn').parent().attr('id')).remove();
    $('#newpost').remove();
    $(".tab-blink").remove();
}