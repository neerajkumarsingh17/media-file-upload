from edxmako.shortcuts import render_to_response
from resources.models import Grade, ContentPartner, Subject, FileTypes
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import *
from .models import *


def homePageView(request):
    grades = Grade.objects.all()
    contentpartners = ContentPartner.objects.all()
    subjects = Subject.objects.all()
    filetypes = FileTypes.objects.all()
    context = {
        'grades': grades,
        'contentpartners':contentpartners,
        'subjects':subjects,
        'filetypes':filetypes,
    }
    return render_to_response('resourse_filrtype.html', context)

def fileTypeForm(request):
    grades = Grade.objects.all()
    contentpartners = ContentPartner.objects.all()
    subjects = Subject.objects.all()
    filetypes = FileTypes.objects.all()
    context = {
        'grades': grades,
        'contentpartners':contentpartners,
        'subjects':subjects,
        'filetypes':filetypes,
    }
    return render_to_response('file_filetype.html', context)


def videoTypeForm(request):
    grades = Grade.objects.all()
    contentpartners = ContentPartner.objects.all()
    subjects = Subject.objects.all()
    filetypes = FileTypes.objects.all()
    context = {
        'grades': grades,
        'contentpartners':contentpartners,
        'subjects':subjects,
        'filetypes':filetypes,
    }
    return render_to_response('video_filetype.html', context)
    
class DiscussionGroup(APIView):
    """
    Retrieve, update  a ResourceGroupID instance.
    """

    def get(self, request):
        groupName = request.query_params['group_name']
        limit = int(request.query_params['limit'])
        discuss_res_data = DiscussionResourceID.objects.all()
        filter_data = DiscussionResourceID.objects.filter(group_name=groupName).select_related('resource').order_by('-created_at')[:limit]
        serializer = DiscussionResourceIDReadSerializer(filter_data, many=True)
        return Response(serializer.data)

    def post(self, request):
        file_serializer = DiscussionResourceIDWriteSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)




