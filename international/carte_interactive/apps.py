import openpyxl
from django.apps import AppConfig
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.core import serializers
from django.db import OperationalError


class CarteInteractiveConfig(AppConfig):
	name = 'carte_interactive'

	def ready(self): #startup code
		Ecole = self.get_model('Ecole')
		Attr = {
			'pk': 0,
			'ecole': 1,
			'type': 2,
			'ville': 3,
			'adresse': 4,
			'programmes': 5,
			'url': 6
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
						'adresse': row[Attr['adresse']].value,
						'url': row[Attr['url']].value
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
