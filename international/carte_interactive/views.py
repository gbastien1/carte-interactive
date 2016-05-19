# -*- coding: UTF-8 -*-
import json

from django.core.urlresolvers import reverse_lazy
from django.db.utils import OperationalError
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_protect
from django.views.generic import TemplateView, RedirectView
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.core import serializers

from .models import Ecole
import openpyxl


class IndexView(TemplateView):
	template_name = "carte_interactive/index.html"


class CardView(TemplateView):
	template_name = "carte_interactive/carte.html"
	Attr = {
		'ecole': 0,
		'type': 1,
		'ville': 2,
		'programmes': 3,
		'latitude': 4,
		'longitude': 5
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
				nom=row[Attr['ecole']].value,
				type=row[Attr['type']].value,
				ville=row[Attr['ville']].value,
				programmes=row[Attr['programmes']].value,
				latitude=float(row[Attr['latitude']].value),
				longitude=float(row[Attr['longitude']].value))

		# fill json file with Ecole data, for use with Google Javascript API
		json_data = serializers.serialize('json', Ecole.objects.all())
		json_data_url = static('carte_interactive/json/data.json')
		json_data_file = open(app_name + json_data_url, 'w')
		json_data_file.write(json_data)
		json_data_file.close()
	except OperationalError:
		pass


class SearchResultsView(TemplateView):
	template_name = "carte_interactive/search_results.html"
# get search input
# get Ecole objects corresponding to input
# display list of Ecoles with link to detailView


def get_substring(str, start, end):
	return str[str.find(start) + len(start):str.rfind(end)]


def get_type(type_string):
	if '(' in type_string:
		return get_substring(type_string, '(', ')')
	else:
		return type_string


def AjouterEcole(request):

	if request.method == 'POST':
		data = json.loads(request.POST.get('content'))
		_nom = data["nom"]
		_ville = data["ville"]
		_type = data["type"]
		_programmes = data["programmes"]
		_particularites = data["particularites"]
		_latitude = data["latitude"]
		_longitude = data["longitude"]

		ecole, created = Ecole.objects.get_or_create(
			nom=_nom,
			ville=_ville,
			type=get_type(_type),
			programmes=_programmes,
			particularites=_particularites,
			latitude=_latitude,
			longitude=_longitude
		)
		if created:
			print("created!")
			response_data = json.dumps(serializers.serialize('json', [ecole, ]))
		else:
			response_data = "already created";

		return HttpResponse(
			response_data,
			content_type="application/json"
	)


