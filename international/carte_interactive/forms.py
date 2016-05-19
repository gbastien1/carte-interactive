from django import forms


class CreateEcoleForm(forms.Form):
	"""Used to create a new Ecole"""
	nom = forms.CharField(max_length=500)
	type = forms.CharField(max_length=3)
	ville = forms.CharField(max_length=100)
	programmes = forms.CharField(max_length=500)
	particularites = forms.CharField(max_length=1000, widget=forms.Textarea)
	latitude = forms.FloatField()
	longitude = forms.FloatField()
