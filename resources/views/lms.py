import json
from edxmako.shortcuts import render_to_response, render_to_string, marketing_link
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from openedx.core.lib.api.paginators import NamespacedPageNumberPagination
from rest_framework import permissions
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser #for resourse file upload
from rest_framework.views import APIView #file upload
from resources.models import ContentPartner, Grade, Subject, FileTypes, Resource, ResourceBanner
from dateutil import rrule
from datetime import datetime, date
from django.http import Http404 
from rest_framework import status
from django.db.models import Q
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from mx_discourse.models import UserLikeBehavior, UserContentBehavior, Content
# from mx_discourse.serializers import UserLikeBehaviorSerializer
from django.core.serializers import serialize
from resources import serializers


@login_required
def resources_dashboard(request):
    return render_to_response("resources/dashboard.html", {})


class ContentPartnerList(generics.ListAPIView):
    queryset = ContentPartner.objects.all()
    serializer_class = serializers.ContentPartnerSerializer
    pagination_class = NamespacedPageNumberPagination
    permission_classes = (permissions.IsAuthenticated,)

class GradeList(generics.ListAPIView):
    queryset = Grade.objects.all()
    serializer_class = serializers.GradeSerializer
    pagination_class = NamespacedPageNumberPagination
    permission_classes = (permissions.IsAuthenticated,)

class SubjectList(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = serializers.SubjectSerializer
    pagination_class = NamespacedPageNumberPagination
    permission_classes = (permissions.IsAuthenticated,)

class FileTypesList(generics.ListAPIView):
    queryset = FileTypes.objects.all()
    serializer_class = serializers.FileTypesSerializer
    pagination_class = NamespacedPageNumberPagination
    permission_classes = (permissions.IsAuthenticated,)

class ResourceList(generics.ListAPIView):
    serializer_class = serializers.ResourceSerializer
    pagination_class = NamespacedPageNumberPagination
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        """
        This view should return a list of all the purchases
        for the currently authenticated user.
        """
        request_data = self.request.GET

        result = Resource.objects.all()

        if 'search_param' in request_data:
            search_param = request_data.get('search_param')
            result = result.filter(
                    Q(name__icontains = search_param) |
                    Q(description__icontains = search_param)
                )

        
        file_types = request_data.get('file_types', None) #ct1,ct2
        content_partner = request_data.get('content_partner', None) # cp1, cp2
        subject = request_data.get('subject', None) # s1, s2
        grade = request_data.get('grade', None) #g1, g2

        """
        logic:
            query cp1
        """

        base_q = Q()
        if file_types:
            file_types = file_types.split(',')
            base_q = Q(file_type__name__in= file_types)
        if content_partner:
            content_partner = content_partner.split(',')
            base_q &= Q(content_partner__pk__in = content_partner)
        if subject:
            subject = subject.split(',')
            base_q &= Q(subject__pk__in=subject)
        if grade:
            grade = grade.split(',')
            base_q &= Q(grade__pk__in=grade)

        if base_q is not None:
            result = result.filter(
                base_q
            )
        # getting the like source id
        qs_like = Content.objects.filter(Q(userlikebehavior__user=self.request.user) & Q(userlikebehavior__is_active=True))\
            .values("source_id", "rs_type")

        # getting the bookmark source id
        qs_bm = Content.objects.filter(Q(usercontentbehavior__user=self.request.user) & Q(usercontentbehavior__is_active=True))\
            .values("source_id", "rs_type")

        like_ids = [(data["source_id"]) for data in qs_like]
        bookmark_ids = [(data["source_id"]) for data in qs_bm]

        for re in result:
            re.like=False
            re.bookmark=False
            if str(re.id) in like_ids:
                re.like=True
            if str(re.id) in bookmark_ids:
                re.bookmark=True
        return result


class Summary(generics.ListAPIView):

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):

        content_partner = ContentPartner.objects.all()
        content_partner_data = []
        for content_partner_obj in content_partner:
            serializer = serializers.ContentPartnerSerializer(content_partner_obj)
            content_partner_data.append(serializer.data)

        grade = Grade.objects.all()
        grade_data = []
        for grade_obj in grade:
            serializer = serializers.GradeSerializer(grade_obj)
            grade_data.append(serializer.data)

        subject = Subject.objects.all()
        subject_data = []
        for subject_obj in subject:
            serializer = serializers.SubjectSerializer(subject_obj)
            subject_data.append(serializer.data)

        file_types = FileTypes.objects.all()
        file_types_data = []
        for file_types_obj in file_types:
            serializer = serializers.FileTypesSerializer(file_types_obj)
            file_types_data.append(serializer.data)

        context_data = {
            "grade" : grade_data,
            "subject": subject_data,
            "content_type": file_types_data,
            "content_partner": content_partner_data
        }

        return Response(context_data)

class Banner(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset= ResourceBanner.objects.all().order_by('order')  
    serializer_class=serializers.ResourceBannerSerializer


@api_view(['GET'])
def resources_popup(request):
    from ..serializers import ResourcesSerializer

    resources_id = request.query_params.get('id', None)
    result = Resource.objects.filter(Q(id=resources_id))
    serializer = ResourcesSerializer(result, many=True)
    data = serializer.data

    return Response(data)


class FileView(APIView):

    def post(self, request, *args, **kwargs):
        request.data.update({"created_by": request.user.id})
        # request.data.update({"grade": request.data['grade'].split(',')})
        file_serializer = serializers.FileSerializer(data=request.data)
        if file_serializer.is_valid():
            resourse_obj = file_serializer.save()
            # return Response(file_serializer.data, status=status.HTTP_201_CREATED)
            return Response({
                "id": resourse_obj.id,
                "name": resourse_obj.name,
                "file": resourse_obj.file.url,   
                "user":resourse_obj.created_by.username,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


