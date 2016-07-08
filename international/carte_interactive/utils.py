from django.contrib.staticfiles.templatetags.staticfiles import static
from django.apps import AppConfig
from django.core import serializers
from django.db import OperationalError

import openpyxl

Attr = {
	'pk': 0,
	'type': 1,
	'ecole': 2,
	'nom_court': 3,
	'rue': 4,
	'ville': 5,
	'pays': 6,
	'code_postal': 7,
	'url': 8,
	'programmes_uqac': 9,
	'programmes_partenaires': 10,
	'particularites': 11
}

def load_data_from_excel(Ecole) :
	
	app_name = 'carte_interactive'
	data_url = static('carte_interactive/data/data.xlsx')
	ecole_data = openpyxl.load_workbook(app_name + data_url, data_only=True)
	sheet = ecole_data.get_sheet_by_name('data')
	ecoles = sheet.rows
	Ecole.objects.all().delete()
	try:
		for row in ecoles[1:]:
			if row[Attr['rue']].value and row[Attr['ville']].value and row[Attr['pays']].value and row[Attr['code_postal']].value :
				address = row[Attr['rue']].value + ', ' + str(row[Attr['code_postal']].value) + ' ' + row[Attr['ville']].value + ', ' + row[Attr['pays']].value
			else:
				address = ""
			# create Ecole objects with content of Excel file
			ecole = Ecole.objects.create(
				pk=row[Attr['pk']].value,
				nom= row[Attr['ecole']].value,
				nom_court= row[Attr['nom_court']].value,
				type= row[Attr['type']].value,
				ville= row[Attr['ville']].value,
				programmes_uqac= row[Attr['programmes_uqac']].value,
				programmes_partenaires= row[Attr['programmes_partenaires']].value,
				adresse= address,
				url= row[Attr['url']].value,
				particularites= row[Attr['particularites']].value
			)

		# fill json file with Ecole data, for use with Google Javascript API
		json_data = serializers.serialize('json', Ecole.objects.all())
		json_data_url = static('carte_interactive/json/data.json')
		json_data_file = open(app_name + json_data_url, 'w')
		json_data_file.write(json_data)
		json_data_file.close()
	
	except OperationalError:
		pass