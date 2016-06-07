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


# get string inbetween two characters in other string
def get_substring(str, start, end):
	return str[str.find(start) + len(start):str.rfind(end)]

# get what's inbetween ( and ) in string
def get_type(type_string):
	if '(' in type_string:
		return get_substring(type_string, '(', ')')
	else:
		return type_string


# url: carte/ajout/
def AjouterEcole(request):

	if request.method == 'POST':
		# get data from ajax request
		data = json.loads(request.POST.get('content'))
		_pk = data["pk"]
		_nom = data["nom"]
		_ville = data["ville"]
		_type = data["type"]
		_programmes = data["programmes"]
		_url = data["url"]
		_adresse = data["adresse"]
		_particularites = data["particularites"]
		_visite = data["visite"]

		# check if something was entered in the form
		# There is a better way using class based views, but with AJAX this is easier
		if not _nom or not _ville or not _programmes or not _adresse or not _type:
			return HttpResponse(
				"incomplete data",
				content_type="application/json"
			)
		# this returns the gotten or created Ecole, and if it was created or not
		ecole, created = Ecole.objects.get_or_create(
			pk=_pk,
			nom=_nom,
			ville=_ville,
			type=get_type(_type),
			programmes=_programmes,
			url=_url,
			adresse=_adresse,
			particularites=_particularites,
			visite=_visite
		)
		if created:
			# add new Ecole object to data.json
			json_data = serializers.serialize('json', Ecole.objects.all())
			json_data_url = static('carte_interactive/json/data.json')
			json_data_file = open(app_name + json_data_url, 'w')
			json_data_file.write(json_data)
			json_data_file.close()
			
			response_data = json.dumps(serializers.serialize('json', [ecole, ]))
			data_url = static('carte_interactive/data/data.xlsx')
			ecole_wb = openpyxl.load_workbook(app_name + data_url)
			sheet = ecole_wb.get_sheet_by_name('data')
			row_count = len(sheet.rows)
			row = row_count + 1
			sheet.cell(row=row, column=1).value = _pk
			sheet.cell(row=row, column=2).value = _nom
			sheet.cell(row=row, column=3).value = get_type(_type)
			sheet.cell(row=row, column=4).value = _ville
			sheet.cell(row=row, column=5).value = _adresse
			sheet.cell(row=row, column=6).value = _programmes
			sheet.cell(row=row, column=7).value = _url
			ecole_wb.save(app_name + data_url)
		else:
			response_data = "already created"
		
		return HttpResponse(
			response_data,
			content_type="application/json"
	)


# url: carte/edit/
def EditerEcole(request):
	if request.method == 'POST':
		data = json.loads(request.POST.get('content'))
		_pk = data["pk"]
		_nom = data["nom"]
		_ville = data["ville"]
		_type = data["type"]
		_programmes = data["programmes"]
		_url = data["url"]
		_adresse = data["adresse"]
		_particularites = data["particularites"]
		_visite = data["visite"]

		if not _pk and not _nom and not _ville and not _programmes and not _particularites:
			return HttpResponse(
				"incomplete data",
				content_type="application/json"
			)

		ecole = Ecole.objects.get(pk=_pk)
		ecole.nom = _nom
		ecole.ville = _ville
		ecole.type = _type
		ecole.programmes = _programmes
		ecole.url = _url
		ecole.adresse = _adresse
		if _particularites: ecole.particularites = _particularites
		ecole.visite = _visite
		ecole.save()

		# update Ecole object in data.json
		json_data = serializers.serialize('json', Ecole.objects.all())
		json_data_url = static('carte_interactive/json/data.json')
		json_data_file = open(app_name + json_data_url, 'w')
		json_data_file.write(json_data)
		json_data_file.close()

		# update Ecole object in data.xlsx
		response_data = serializers.serialize('json', [ecole, ])
		data_url = static('carte_interactive/data/data.xlsx')
		ecole_wb = openpyxl.load_workbook(app_name + data_url)
		sheet = ecole_wb.get_sheet_by_name('data')

		row = int(_pk)
		sheet.cell(row=row, column=2).value = _nom
		sheet.cell(row=row, column=3).value = get_type(_type)
		sheet.cell(row=row, column=4).value = _ville
		sheet.cell(row=row, column=5).value = _adresse
		sheet.cell(row=row, column=6).value = _programmes
		sheet.cell(row=row, column=7).value = _url
		ecole_wb.save(app_name + data_url)

		return HttpResponse(
			response_data,
			content_type="application/json"
	)
