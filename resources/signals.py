import logging

from django.db.models.signals import pre_save, post_delete, post_delete, m2m_changed, post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

from mx_discourse.models import Content

from .models import Resource

log = logging.getLogger(__name__)

# For Resources Model
@receiver(post_save, sender=Resource)
def createResourceContent(sender, instance, *args, **kwargs):
    """
    Create Content instance whenever Resource instance is created.
    """
    log.info("resource add signal is called")
    # TODO: get the admin user which will be assigned as the creator of the content.
    user = User.objects.filter(is_staff=True).first()
    # import pdb; pdb.set_trace()
    # Content.objects.get_or_create(
    #     source_id=instance.id,
    #     title=instance.name,
    #     rs_type="R",
    #     created_by=user,
    # )
    try:
        obj = Content.objects.get(source_id=instance.id, rs_type="R")
        obj.title=instance.name
        obj.save()
        print("updated")
    except Content.DoesNotExist:
        Content.objects.get_or_create( 
        source_id=instance.id,
        title=instance.name,
        rs_type="R",
        created_by=user,
    )
        print('created')

    

@receiver(post_delete, sender=Resource)
def deleteResourceContent(sender, instance, *args, **kwargs):
    """
    Whenever Reource instance is deleted, this will delete correspoding Content.
    """
    log.info("resource delete signal is called")
    try:
        Content.objects.get(source_id=instance.id).delete()
    except Exception as err:
        log.error("Error while deleting WebinarContent: {}".format(err))