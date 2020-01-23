# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0005_auto_20181216_1223'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='image',
            field=models.FileField(db_index=True, upload_to=b'resource_image', blank=True),
        ),
    ]
