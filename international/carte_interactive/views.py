# -*- coding: UTF-8 -*-
import json
from django.contrib.auth import login, logout, authenticate
from django.db.utils import OperationalError
from django.http import HttpResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView, FormView, RedirectView
from django.contrib.auth.forms import AuthenticationForm
from django.core.urlresolvers import reverse_lazy
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.core import serializers

from .models import Ecole
import openpyxl

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
	Attr = {
		'pk': 0,
		'ecole': 1,
		'type': 2,
		'ville': 3,
		'programmes': 4,
		'latitude': 5,
		'longitude': 6
	}
	app_name = 'carte_interactive'
	data_url = static('carte_interactive/data/data.xlsx')
	ecole_data = openpyxl.load_workbook(app_name + data_url)
	sheet = ecole_data.get_sheet_by_name('data')
	ecoles = sheet.rows
	try:
		for row in ecoles:
			# create Ecole objects with content of Excel file
			Ecole.objects.update_or_create(
				pk=row[Attr['pk']].value,
				defaults= {
					'nom': row[Attr['ecole']].value,
					'type': row[Attr['type']].value,
					'ville': row[Attr['ville']].value,
					'programmes': row[Attr['programmes']].value,
					'latitude': float(row[Attr['latitude']].value),
					'longitude': float(row[Attr['longitude']].value)
				}
			)

		# fill json file with Ecole data, for use with Google Javascript API
		json_data = serializers.serialize('json', Ecole.objects.all())
		json_data_url = static('carte_interactive/json/data.json')
		json_data_file = open(app_name + json_data_url, 'w')
		json_data_file.write(json_data)
		json_data_file.close()
	except OperationalError:
		pass

# todo: not used yet
class SearchResultsView(TemplateView):
	template_name = "carte_interactive/search_results.html"
# get search input
# get Ecole objects corresponding to input
# display list of Ecoles with link to detailView


# get string inbetween two characters in other string
def get_substring(str, start, end):
	return str[str.find(start) + len(start):str.rfind(end)]

# get what's inbetween ( and ) in string
def get_type(type_string):
	if '(' in type_string:
		return get_substring(type_string, '(', ')')
	else:
		return type_string


# url: ajout/
def AjouterEcole(request):

	if request.method == 'POST':
		data = json.loads(request.POST.get('content'))
		_pk = data["pk"]
		_nom = data["nom"]
		_ville = data["ville"]
		_type = data["type"]
		_programmes = data["programmes"]
		_particularites = data["particularites"]
		_latitude = data["latitude"]
		_longitude = data["longitude"]

		if not _nom or not _ville or not _programmes:
			return HttpResponse(
				"incomplete data",
				content_type="application/json"
			)
	
		ecole, created = Ecole.objects.get_or_create(
			pk=_pk,
			nom=_nom,
			ville=_ville,
			type=get_type(_type),
			programmes=_programmes,
			particularites=_particularites,
			latitude=_latitude,
			longitude=_longitude
		)
		if created:
			response_data = json.dumps(serializers.serialize('json', [ecole, ]))
			app_name = 'carte_interactive'
			data_url = static('carte_interactive/data/data.xlsx')
			ecole_wb = openpyxl.load_workbook(app_name + data_url)
			sheet = ecole_wb.get_sheet_by_name('data')
			row_count = len(sheet.rows)
			row = row_count + 1
			sheet.cell(row=row, column=1).value = _nom
			sheet.cell(row=row, column=2).value = get_type(_type)
			sheet.cell(row=row, column=3).value = _ville
			sheet.cell(row=row, column=4).value = _programmes
			sheet.cell(row=row, column=5).value = _latitude
			sheet.cell(row=row, column=6).value = _longitude
			ecole_wb.save(app_name + data_url)
		else:
			response_data = "already created"
		
		return HttpResponse(
			response_data,
			content_type="application/json"
	)


# url: edit/
def EditerEcole(request):

	if request.method == 'POST':
		data = json.loads(request.POST.get('content'))
		_pk = data["pk"]
		_nom = data["nom"]
		_ville = data["ville"]
		_type = data["type"]
		_programmes = data["programmes"]
		_particularites = data["particularites"]
		_latitude = data["latitude"]
		_longitude = data["longitude"]

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
		if _particularites: ecole.particularites = _particularites
		ecole.save()

		response_data = json.dumps(serializers.serialize('json', [ecole, ]))
		app_name = 'carte_interactive'
		data_url = static('carte_interactive/data/data.xlsx')
		ecole_wb = openpyxl.load_workbook(app_name + data_url)
		sheet = ecole_wb.get_sheet_by_name('data')
		
		row = int(_pk)
		sheet.cell(row=row, column=2).value = _nom
		sheet.cell(row=row, column=3).value = get_type(_type)
		sheet.cell(row=row, column=4).value = _ville
		sheet.cell(row=row, column=5).value = _programmes
		sheet.cell(row=row, column=6).value = _latitude
		sheet.cell(row=row, column=7).value = _longitude
		ecole_wb.save(app_name + data_url)
		
		return HttpResponse(
			response_data,
			content_type="application/json"
	)
