# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0003_auto_20181215_1220'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='description',
            field=models.TextField(blank=True),
        ),
    ]
