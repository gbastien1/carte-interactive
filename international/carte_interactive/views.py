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


# url: carte/upload/
class UploadExcelView(RedirectView):
	url = reverse_lazy('carte_interactive:carte')

	def post(self, request, *args, **kwargs):
		uploaded_excel_file = request.FILES['input4']
		app_name = 'carte_interactive'
		data_url = static('carte_interactive/data/data.xlsx')
		data_file_path = app_name + data_url
		return super(UploadExcelView, self).post(request, *args, **kwargs)


# url: carte/SavePosition/
def SavePositionView(request):
	if request.method == 'POST':
		data = json.loads(request.POST.get('content'))
		_pk = data["pk"]
		_latitude = data["latitude"]
		_longitude = data["longitude"]

		ecole = Ecole.objects.get(pk=_pk)
		ecole.latitude = float(_latitude)
		ecole.longitude = float(_longitude)
		ecole.save()

		# update Ecole object in data.json
		json_data = serializers.serialize('json', Ecole.objects.all())
		json_data_url = static('carte_interactive/json/data.json')
		json_data_file = open(app_name + json_data_url, 'w')
		json_data_file.write(json_data)
		json_data_file.close()

		response_data = "success"
		return HttpResponse(
			response_data,
			content_type="text/plain"
		)


# url: carte/edit/
def EditerEcole(request):
	if request.method == 'POST':
		data = json.loads(request.POST.get('content'))
		_pk = data["pk"]
		_visite = data["visite"]
		_visite_date = data["date"]

		ecole = Ecole.objects.get(pk=_pk)
		ecole.visite = _visite
		if ecole.visite:
			ecole.visite_date = _visite_date
		else:
			ecole.visite_date = ""
		ecole.save()

		# update Ecole object in data.json
		json_data = serializers.serialize('json', Ecole.objects.all())
		json_data_url = static('carte_interactive/json/data.json')
		json_data_file = open(app_name + json_data_url, 'w')
		json_data_file.write(json_data)
		json_data_file.close()

		response_data = serializers.serialize('json', [ecole, ])
		return HttpResponse(
			response_data,
			content_type="application/json"
		)


# get string inbetween two characters in other string
def get_substring(str, start, end):
	return str[str.find(start) + len(start):str.rfind(end)]

# get what's inbetween ( and ) in string
def get_type(type_string):
	if '(' in type_string:
		return get_substring(type_string, '(', ')')
	else:
		return type_string

