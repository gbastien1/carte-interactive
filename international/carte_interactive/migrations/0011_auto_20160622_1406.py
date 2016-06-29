# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-06-22 18:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('carte_interactive', '0010_auto_20160621_1107'),
    ]

    operations = [
        migrations.AddField(
            model_name='ecole',
            name='latitude',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ecole',
            name='longitude',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ecole',
            name='visite_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]