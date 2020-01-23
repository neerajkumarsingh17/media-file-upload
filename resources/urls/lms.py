"""
URLs for Resources LMS
"""
from django.conf.urls import patterns, url, include
from resources.views import lms as views

urlpatterns = [
    url(r'^$', views.resources_dashboard, name='resources_dashboard'),
    url(r'^api/content-partners/$', views.ContentPartnerList.as_view()),
    url(r'^api/grades/$', views.GradeList.as_view()),
    url(r'^api/subjects/$', views.SubjectList.as_view()),
    url(r'^api/content-types/$', views.FileTypesList.as_view()),
    url(r'^api/summary/$', views.Summary.as_view()),
    url(r'^api/content/$', views.ResourceList.as_view()),
    url(r'^api/banner/$', views.Banner.as_view()),
    url(r'^api/resources_popup/$', views.resources_popup, name='resources_popup'),
    url(r'^upload/$', views.FileView.as_view(), name='file-upload'), #popup file upload 
]
