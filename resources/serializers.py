from rest_framework import serializers
from django.contrib.auth.models import User
from resources.models import ContentPartner, Grade, Subject, FileTypes, Resource, ResourceBanner
import time

class ContentPartnerSerializer(serializers.ModelSerializer):

    course_count = serializers.SerializerMethodField()

    class Meta:
        model = ContentPartner
        fields = ('id', 'name', 'icon', 'slug', 'course_count')

    def get_course_count(self, obj):
        return obj.content_partner_obj.count()

class GradeSerializer(serializers.ModelSerializer):

    course_count = serializers.SerializerMethodField()

    class Meta:
        model = Grade
        fields = ('id', 'name', 'slug', 'course_count')

    def get_course_count(self, obj):
        return obj.grade_obj.count()


class SubjectSerializer(serializers.ModelSerializer):

    course_count = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ('id', 'name', 'slug', 'course_count')

    def get_course_count(self, obj):
        return obj.subject_obj.count()

class FileTypesSerializer(serializers.ModelSerializer):

    course_count = serializers.SerializerMethodField()

    class Meta:
        model = FileTypes
        fields = ('id', 'name', 'icon', 'course_count')

    def get_course_count(self, obj):
        return obj.file_type_obj.count()

class GradeDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Grade
        fields = ('id', 'name')

class ResourceSerializer(serializers.ModelSerializer):

    file_type_name = serializers.CharField(source="file_type.name")
    subject_name = serializers.CharField(source="subject.name")
    content_partner_name = serializers.CharField(source="content_partner.name")
    ts = serializers.SerializerMethodField()
    grade = GradeDetailsSerializer(many=True, required=False)
    like=serializers.BooleanField(default=False)
    bookmark=serializers.BooleanField(default=False)

    class Meta:
        model = Resource
        fields = ('id', 'name', 'file', 'link', 'file_type', 'grade', 
            'subject', 'content_partner', 'created_by', 'file_type_name',
            'subject_name', 'content_partner_name', 'description', 'source_url', 'ts', 'placeholder_image','like','bookmark'
            )

    def get_ts(self, obj):
        return int(time.time())


class ResourcesSerializer(serializers.ModelSerializer):
    file_type_name = serializers.CharField(source="file_type.name")
    subject_name = serializers.CharField(source="subject.name")
    content_partner_name = serializers.CharField(source="content_partner.name")
    ts = serializers.SerializerMethodField()
    grade = GradeDetailsSerializer(many=True, required=False)
    created_by = serializers.CharField(source="created_by.username")    
    class Meta:
        model = Resource
        fields = ('id', 'name', 'file', 'description', 'source_url', 'file_type', 'grade', 
            'subject', 'content_partner', 'created_by','file_type_name','subject_name','content_partner_name',
            'ts','grade'
            )

    def get_ts(self, obj):
        return int(time.time())


class ResourceBannerSerializer(serializers.ModelSerializer):

    image = serializers.ImageField(
            max_length = None,
        )
    class Meta:
        model = ResourceBanner
        fields = ('image', 'redirect_url', 'order')

# class CurrentUserSerializer(serializers.Serializer):
#     class Meta:
#         model = User
#         fields = ('id')


class FileSerializer(serializers.ModelSerializer):
    file_type = serializers.CharField(source="file_type.name")
    subject = serializers.CharField(source="subject.name")
    content_partner = serializers.CharField(source="content_partner.name")
    # grade = GradeDetailsSerializer(many=True, required=False)
    grade = serializers.ListField(child=serializers.CharField())
    
    # created_by = CurrentUserSerializer(many=False, read_only=True)
    class Meta():
        model = Resource
        fields = ('id','file', 'name', 'file_type', 'grade', 'subject', 'content_partner', 'created_by')

    def create(self, validated_data):
        print(validated_data)
        print(self.context.get("created_by"))
        content_partner_name = validated_data[u'content_partner']['name']
        created_by = validated_data[u'created_by']
        file = validated_data[u'file']
        grade_names = validated_data[u'grade']
        # grade_names = ["I", "II","IV"]
        subject_name = validated_data[u'subject']['name']
        file_type_name = validated_data[u'file_type']['name']
        try:
            content_partner = ContentPartner.objects.get(name=content_partner_name)
            file_type = FileTypes.objects.get(name=file_type_name)
            # grade = Grade.objects.get(name=grade_name)
            grade_list = Grade.objects.filter(name__in=grade_names)
            subject = Subject.objects.get(name=subject_name)
        except:
            raise
       
        name = validated_data[u'name']
        resource = Resource.objects.create(content_partner=content_partner, created_by=created_by,file=file, file_type=file_type, subject=subject, name=name)
        resource.grade.add(*grade_list)
        resource.save()
        
        return resource