from django.db import models


class Ecole(models.Model):
	nom = models.CharField(max_length=500, default='')
	type = models.CharField(max_length=3, default='', blank=True)
	ville = models.CharField(max_length=100, default='')
	programmes = models.CharField(max_length=500, blank=True)
	adresse = models.CharField(max_length=500, default='', blank=True)
	particularites = models.CharField(max_length=1000, blank=True)

	def __str__(self):
		return self.nom

