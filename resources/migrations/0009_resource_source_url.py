# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0008_auto_20190319_1257'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='source_url',
            field=models.TextField(blank=True),
        ),
    ]
