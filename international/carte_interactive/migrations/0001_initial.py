# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-07-07 18:32
from __future__ import unicode_literals

import carte_interactive.storage
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Ecole',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(default='', max_length=500)),
                ('nom_court', models.CharField(blank=True, default='', max_length=15, null=True)),
                ('type', models.CharField(blank=True, default='', max_length=3)),
                ('ville', models.CharField(default='', max_length=100, null=True)),
                ('programmes_uqac', models.CharField(blank=True, max_length=500, null=True)),
                ('programmes_partenaires', models.CharField(blank=True, max_length=500, null=True)),
                ('adresse', models.CharField(blank=True, default='', max_length=500, null=True)),
                ('particularites', models.CharField(blank=True, max_length=1000, null=True)),
                ('url', models.CharField(blank=True, max_length=1000, null=True)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                ('visite', models.BooleanField(default=False)),
                ('visite_date', models.CharField(blank=True, max_length=10, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ExcelFile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(default='', storage=carte_interactive.storage.OverwriteStorage(), upload_to='.')),
            ],
        ),
    ]
