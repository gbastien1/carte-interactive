# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-05-20 17:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('carte_interactive', '0003_auto_20160519_1142'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ecole',
            name='programmes',
            field=models.CharField(blank=True, max_length=500),
        ),
    ]