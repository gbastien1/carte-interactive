# -*- coding: UTF-8 -*-
from django.db.utils import OperationalError
from django.views.generic import TemplateView
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
		'type_ecole': 1,
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
				type_ecole=row[Attr['type_ecole']].value,
				ville=row[Attr['ville']].value,
				programmes=row[Attr['programmes']].value,
				latitude=float(row[Attr['latitude']].value),
				longitude=float(row[Attr['longitude']].value))

		print("nbr d'écoles dans BD:" + str(Ecole.objects.all().count()))

		# fill json file with Ecole data, for use with Google Javascript API
		json_data = serializers.serialize('json', Ecole.objects.all())
		json_data_url = static('carte_interactive/json/data.json')
		json_data_file = open(app_name + json_data_url, 'w', -1, 'utf-8')
		json_data_file.write(json_data)
		json_data_file.close()
	except OperationalError:
		pass


class SearchResultsView(TemplateView):
	template_name = "carte_interactive/search_results.html"
	# get search input
	# get Ecole objects corresponding to input
	# display list of Ecoles with link to detailView
