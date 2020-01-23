from django.db import models
from resources.models import Resource


class DiscussionResourceID(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    group_name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)