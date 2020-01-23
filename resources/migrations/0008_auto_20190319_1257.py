# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0007_auto_20190130_1142'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='resource',
            name='grade',
        ),
        migrations.AddField(
            model_name='resource',
            name='grade',
            field=models.ManyToManyField(related_name='grade_obj', to='resources.Grade'),
        ),
    ]
