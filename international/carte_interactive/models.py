from django.db import models


class Ecole(models.Model):
	nom = models.CharField(max_length=500, default='')
	type_ecole = models.CharField(max_length=3, default='', blank=True)
	ville = models.CharField(max_length=100, default='')
	programmes = models.CommaSeparatedIntegerField(max_length=500, blank=True)
	latitude = models.FloatField()
	longitude = models.FloatField()


