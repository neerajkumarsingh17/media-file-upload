# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='file',
            field=models.FileField(default=None, upload_to=b'resources', db_index=True),
            preserve_default=False,
        ),
    ]
