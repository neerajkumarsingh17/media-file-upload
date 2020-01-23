require.config({

    baseUrl: '/static/firki_theme_new/js/resources/lib',

    paths: {
        app: '../app',
        tpl: '../templates',
        jquery: 'jquery',
        bootstrap: 'bootstrap.min',
        cookie: 'jquery.cookie',
        datatable: 'datatable',
    },

    shim: {
        'backbone': {
            deps: ['underscore'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'bootstrap': {
            dep: ['jquery'],
            exports: 'Bootstrap'
        },
        'cookie': {
            dep: ['jquery'],
            exports: 'Cookie'
        },
        'datatable': {
            dep: ['datatable'],
            exports: 'Datatable'
        }
    }
});

require(['jquery', 'backbone', 'app/views/left-nav', 'app/views/search-form', 'app/views/banner'], function($, Backbone, LeftNavView, SearchView, BannerView) {
    if (navigator.userAgent.trim().toLowerCase().includes("firki")) { $('.for_mob_app').hide(); }
    var $left_nav = new LeftNavView();
    var $search_form = new SearchView({ left_nav: $left_nav });
    var $banner = new BannerView();
});