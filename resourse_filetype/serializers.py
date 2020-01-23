from rest_framework import serializers
from .models import DiscussionResourceID
from resources.serializers import ResourcesSerializer

class DiscussionResourceIDWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscussionResourceID
        fields = ('resource', 'group_name', 'created_at')



class DiscussionResourceIDReadSerializer(serializers.ModelSerializer):
    resource = ResourcesSerializer()
    class Meta:
        model = DiscussionResourceID
        fields = ('resource', 'group_name', 'created_at')
