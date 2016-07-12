# -*- coding: UTF-8 -*-
import json
from django.http import HttpResponse
from django.db.utils import OperationalError
from django.core.exceptions import ObjectDoesNotExist
from django.core.urlresolvers import reverse_lazy
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.forms import AuthenticationForm
from django.views.generic import FormView, RedirectView
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.core import serializers

from .utils import *
from .models import Ecole, ExcelFile
from .forms import ExcelUploadForm
import openpyxl

app_name = 'carte_interactive'
reload_value = False


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


# url: carte/
class CardView(LoginRequiredMixin, FormView):
	form_class = ExcelUploadForm
	template_name = "carte_interactive/carte.html"

	def get_success_url(self):
		return reverse_lazy('carte_interactive:carte')

	def form_valid(self, form):
		uploaded_file = self.request.FILES['file']
		if uploaded_file.name.split(".")[-1] == 'xlsx':
			# replace file on server with new data.xlsx
			uploaded_file.name = "data.xlsx"
			excelFile = ExcelFile()
			excelFile.file = uploaded_file
			excelFile.save()

			global reload_value
			reload_value = True

		return super(CardView, self).form_valid(form)


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


# url: carte/reinit
def ReinitVisitsView(request):
	if request.method == 'POST':

		ecoles = Ecole.objects.all()
		for ecole in ecoles:
			ecole.visite = False
			ecole.visite_date = ""
			ecole.save()

		# update Ecole objects in data.json
		json_data = serializers.serialize('json', Ecole.objects.all())
		json_data_url = static('carte_interactive/json/data.json')
		json_data_file = open(app_name + json_data_url, 'w')
		json_data_file.write(json_data)
		json_data_file.close()

		response_data = json.dumps({"visite": False, "visite_date": ""})
	return HttpResponse(
		response_data,
		content_type="text/plain"
	)


# url: carte/SavePosition/
def SavePositionView(request):
	if request.method == 'POST':
		data = json.loads(request.POST.get('content'))

		_pk = data["pk"]
		_latitude = data["latitude"]
		_longitude = data["longitude"]

		try:
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

			response_data = serializers.serialize('json', [ecole, ])
		except ObjectDoesNotExist:
			pass
			response_data = json.dumps({"status": "404 Ecole not found"})
		return HttpResponse(
			response_data,
			content_type="application/json"
		)


def GetDataView(request):
	if request.method == 'GET':
		response_data = serializers.serialize('json', Ecole.objects.all())
		return HttpResponse(
			response_data,
			content_type="application/json"
		)

def GetReloadView(request):
	if request.method == 'GET':
		response_data = json.dumps({"reload": reload_value})
		return HttpResponse(
			response_data,
			content_type="application/json"
		)


def SetReloadView(request):
	if request.method == 'POST':
		reload_value = False
		return HttpResponse(
			"200 OK",
			content_type="text/plain"
		)


def UpdateEcolesView(request):
	if request.method == 'POST':
		updateCoordinates()
		# updates Ecole objects and data.json
		load_data_from_excel(Ecole, getVisits())
		return HttpResponse(
			"200 OK",
			content_type="text/plain"
		)


def updateCoordinates():
	coordinates_data = []
	ecoles = Ecole.objects.all()
	for ecole in ecoles:
		if ecole.latitude and ecole.longitude:
			coordinates_data.append({"nom": ecole.nom, "lat": ecole.latitude, "lng": ecole.longitude})
	coordinates_json_data = json.dumps(coordinates_data)
	# rewrite coordinates in coords.json
	json_coords_url = static('carte_interactive/json/coords.json')
	json_coords_file = open(app_name + json_coords_url, 'w')
	json_coords_file.write(coordinates_json_data)
	json_coords_file.close()


def getVisits():
	ecole_visits = []
	ecoles = Ecole.objects.all()
	for ecole in ecoles:
		ecole_visits.append({"nom": ecole.nom, "visite": ecole.visite, "visite_date": ecole.visite_date})
	return json.dumps(ecole_visits)


# get string inbetween two characters in other string
def get_substring(str, start, end):
	return str[str.find(start) + len(start):str.rfind(end)]


# get what's inbetween ( and ) in string
def get_type(type_string):
	if '(' in type_string:
		return get_substring(type_string, '(', ')')
	else:
		return type_string
