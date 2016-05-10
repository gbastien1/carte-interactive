# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-05-10 18:09
from __future__ import unicode_literals

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
                ('type_ecole', models.CharField(blank=True, default='', max_length=3)),
                ('ville', models.CharField(default='', max_length=100)),
                ('programmes', models.CommaSeparatedIntegerField(blank=True, max_length=500)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
            ],
        ),
    ]
