# -*- coding: UTF-8 -*-
import json
from django.http import HttpResponse
from django.db.utils import OperationalError
from django.core.urlresolvers import reverse_lazy
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.forms import AuthenticationForm
from django.views.generic import TemplateView, FormView, RedirectView
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.core import serializers

from .models import Ecole
import openpyxl

app_name = 'carte_interactive'

# url: /
class LoginView(FormView):
	template_name = "carte_interactive/index.html"
	form_class = AuthenticationForm
	success_url = reverse_lazy('carte_interactive:carte')

	def form_valid(self, form):
		login(self.request, form.get_user())
		return super(LoginView, self).form_valid(form)


# url: logout/
class LogoutView(RedirectView):
	url = reverse_lazy('carte_interactive:login')

	def get(self, request, *args, **kwargs):
		logout(request)
		return super(LogoutView, self).get(request, *args, **kwargs)


#url: carte/
class CardView(LoginRequiredMixin, TemplateView):
	template_name = "carte_interactive/carte.html"


# url: logout/
class UploadExcelView(RedirectView):
	url = reverse_lazy('carte_interactive:carte')

	def post(self, request, *args, **kwargs):
		uploaded_excel_file = request.FILES['input4']
		app_name = 'carte_interactive'
		data_url = static('carte_interactive/data/data.xlsx')
		data_file_path = app_name + data_url
		return super(UploadExcelView, self).post(request, *args, **kwargs)


# get string inbetween two characters in other string
def get_substring(str, start, end):
	return str[str.find(start) + len(start):str.rfind(end)]

# get what's inbetween ( and ) in string
def get_type(type_string):
	if '(' in type_string:
		return get_substring(type_string, '(', ')')
	else:
		return type_string

