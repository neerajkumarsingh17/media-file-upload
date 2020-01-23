# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0004_resource_description'),
    ]

    operations = [
        migrations.RenameField(
            model_name='resource',
            old_name='s3_file_path',
            new_name='link',
        ),
    ]
