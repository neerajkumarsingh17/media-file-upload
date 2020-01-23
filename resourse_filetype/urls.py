from django.conf.urls import url, include
from .views import *

urlpatterns = [
    url(r'^$', homePageView, name="home-page"),
    url(r'^file/$', fileTypeForm, name="home-file"),
    url(r'^video/$', videoTypeForm, name="home-video"),
    url(r'^discussion_group/$', DiscussionGroup.as_view(), name='discussion_group'),
]