# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0002_resource_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='resource',
            name='content_partner',
            field=models.ForeignKey(related_name='content_partner_obj', to='resources.ContentPartner'),
        ),
        migrations.AlterField(
            model_name='resource',
            name='file',
            field=models.FileField(db_index=True, upload_to=b'resources', blank=True),
        ),
        migrations.AlterField(
            model_name='resource',
            name='s3_file_path',
            field=models.TextField(blank=True),
        ),
    ]
