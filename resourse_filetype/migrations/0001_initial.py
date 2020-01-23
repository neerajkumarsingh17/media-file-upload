# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0011_merge'),
    ]

    operations = [
        migrations.CreateModel(
            name='DiscussionResourceID',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('group_name', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('resource', models.ForeignKey(to='resources.Resource')),
            ],
        ),
    ]
