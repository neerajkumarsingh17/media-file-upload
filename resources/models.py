from django.db import models
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from boto.s3.connection import S3Connection
from contextlib import contextmanager
from boto.s3.key import Key
from django.utils.translation import gettext as _

behaviour_type = [
        ('b','Bookmark'),
        ('s','share'),
    ]
class ContentPartner(models.Model):

    name = models.CharField(max_length=254, blank=False)
    icon = models.CharField(max_length=254, blank=True)
    slug = models.SlugField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name

    def slug(self):
        return slugify(self.name)


class Grade(models.Model):

    name = models.CharField(max_length=254, blank=False)
    slug = models.SlugField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name

    def slug(self):
        return slugify(self.name)


class Subject(models.Model):

    name = models.CharField(max_length=254, blank=False)
    slug = models.SlugField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name

    def slug(self):
        return slugify(self.name)


class FileTypes(models.Model):

    name = models.CharField(max_length=254, blank=False)
    icon = models.CharField(max_length=254, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name


class Resource(models.Model):

    name = models.CharField(max_length=254, blank=False)
    description = models.TextField(blank=True)
    source_url = models.TextField(blank=True)
    file_type = models.ForeignKey(FileTypes, related_name="file_type_obj")
    # grade = models.ForeignKey(Grade, related_name="grade_obj")
    grade = models.ManyToManyField(Grade, related_name="grade_obj")
    subject = models.ForeignKey(Subject, related_name="subject_obj")
    content_partner = models.ForeignKey(ContentPartner, related_name="content_partner_obj")

    file = models.FileField(db_index=True, blank=True, upload_to='resources')
    placeholder_image = models.FileField(db_index=True, blank=True, upload_to='resource_image')

    link = models.TextField(blank=True)
    created_by = models.ForeignKey(User, related_name="created_by_obj")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name


class ResourceBanner(models.Model):
    image = models.ImageField(upload_to='resourse_banner/')
    redirect_url = models.URLField(max_length=250, blank=True)
    order = models.IntegerField(default=0)
    created_by = models.ForeignKey(User, related_name="resource_banner_created_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)





