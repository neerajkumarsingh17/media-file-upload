# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resourse_filetype', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='discussionresourceid',
            name='username',
            field=models.CharField(max_length=50, blank=True),
        ),
    ]
