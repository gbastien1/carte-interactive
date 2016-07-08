from django.contrib import admin

from .models import ExcelFile, Ecole

admin.site.register(Ecole)
admin.site.register(ExcelFile)