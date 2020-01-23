from django import forms
from resources.models import Grade


class GradeListForm(forms.ModelForm):
    # here we only need to define the field we want to be editable
    grade = forms.ModelMultipleChoiceField(
        queryset=Grade.objects.all(), required=False)