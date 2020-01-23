from django.contrib import admin
from resources.models import ContentPartner, Grade, Subject, FileTypes, Resource,ResourceBanner
from django.contrib.admin.views.main import ChangeList
from resources.forms import GradeListForm

class ContentPartnerAdmin(admin.ModelAdmin):

    list_display = ['name', 'icon', 'slug', 'created_at', 'updated_at']
    list_filter = ['name']
    search_fields = ['name']


class GradeAdmin(admin.ModelAdmin):

    list_display = ['name', 'slug', 'created_at', 'updated_at']
    list_filter = ['name']
    search_fields = ['name']


class SubjectAdmin(admin.ModelAdmin):

    list_display = ['name', 'slug', 'created_at', 'updated_at']
    list_filter = ['name']
    search_fields = ['name']

class FileTypesAdmin(admin.ModelAdmin):

    list_display = ['name', 'created_at', 'updated_at']
    list_filter = ['name']
    search_fields = ['name']


class GradeChangeList(ChangeList):

    def __init__(self, request, model, list_display,
        list_display_links, list_filter, date_hierarchy,
        search_fields, list_select_related, list_per_page,
        list_max_show_all, list_editable, model_admin):

        super(GradeChangeList, self).__init__(request, model,
                list_display, list_display_links, list_filter,
                date_hierarchy, search_fields, list_select_related,
                list_per_page, list_max_show_all, list_editable, 
                model_admin)
        
        # these need to be defined here
        self.list_display = ['name', 'file_type', 'subject', 'content_partner', 'created_by']
        self.list_display_links = ['name']
        self.list_editable = ['grade']

class ResourceAdmin(admin.ModelAdmin):

    list_filter = ['file_type', 'grade', 'subject', 'content_partner']
    search_fields = ['name' 'file_type', 'grade', 'subject', 'content_partner', 'created_by']

    def get_changelist(self, request, **kwargs):
        return GradeChangeList

    def get_changelist_form(self, request, **kwargs):
        return GradeListForm

class ResourceBannerAdmin(admin.ModelAdmin):

    list_display = ['id','image', 'redirect_url', 'order', 'created_at', 'updated_at']
    list_filter = ['order']
    search_fields = ['url']

admin.site.register(ContentPartner, ContentPartnerAdmin)
admin.site.register(Grade, GradeAdmin)
admin.site.register(Subject, SubjectAdmin)
admin.site.register(FileTypes, FileTypesAdmin)
admin.site.register(Resource, ResourceAdmin)
admin.site.register(ResourceBanner, ResourceBannerAdmin)