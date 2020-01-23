# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0006_resource_image'),
    ]

    operations = [
        migrations.RenameField(
            model_name='resource',
            old_name='image',
            new_name='placeholder_image',
        ),
    ]
