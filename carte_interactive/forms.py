from django import forms
from django.forms import ModelForm

from .models import ExcelFile


class ExcelUploadForm(forms.ModelForm):
	class Meta:
		model = ExcelFile
		fields = ['file']
