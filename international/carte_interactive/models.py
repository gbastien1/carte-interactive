from django.db import models
from carte_interactive.storage import OverwriteStorage

"""
class Ecole(models.Model):
	nom = models.CharField(max_length=500, default='')
	nom_court = models.CharField(max_length=15, default='', blank=True, null=True)
	type = models.CharField(max_length=3, default='', blank=True)
	ville = models.CharField(max_length=100, default='', null=True)
	programmes_uqac = models.CharField(max_length=500, blank=True, null=True)
	programmes_partenaires = models.CharField(max_length=500, blank=True, null=True)
	adresse = models.CharField(max_length=500, default='', blank=True, null=True)
	particularites = models.CharField(max_length=1000, blank=True, null=True)
	url = models.CharField(max_length=1000, blank=True, null=True)
	latitude = models.FloatField(blank=True, null=True)
	longitude = models.FloatField(blank=True, null=True)
	visite = models.BooleanField(default=False)
	visite_date = models.CharField(max_length=10, blank=True, null=True)

	def __str__(self):
		return self.nom
"""
class ExcelFile(models.Model):
	file = models.FileField(storage=OverwriteStorage(), upload_to=".", default="")