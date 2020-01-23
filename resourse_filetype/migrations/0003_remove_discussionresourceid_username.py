# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resourse_filetype', '0002_discussionresourceid_username'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='discussionresourceid',
            name='username',
        ),
    ]
