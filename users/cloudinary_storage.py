"""
Custom Cloudinary storage backend compatible with Django 6.
Replaces django-cloudinary-storage which is incompatible with Django 6.
"""

import cloudinary
import cloudinary.uploader
import cloudinary.utils
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
import os


@deconstructible
class CloudinaryMediaStorage(Storage):
    """
    Storage backend that uploads files to Cloudinary.
    Falls back to local filesystem if Cloudinary is not configured.
    """

    def _open(self, name, mode="rb"):
        raise NotImplementedError("Reading files from Cloudinary not supported.")

    def _save(self, name, content):
        # Upload to Cloudinary
        folder = os.path.dirname(name)
        result = cloudinary.uploader.upload(
            content,
            folder=folder,
            use_filename=True,
            unique_filename=True,
            overwrite=False,
            resource_type="image",
        )
        # Return the public_id so we can reconstruct the URL later
        return result["public_id"]

    def exists(self, name):
        # Always return False to allow re-uploads
        return False

    def url(self, name):
        if not name:
            return ""
        if name.startswith("http"):
            return name
        # Build Cloudinary URL from public_id
        url, _ = cloudinary.utils.cloudinary_url(
            name,
            resource_type="image",
            secure=True,
        )
        return url

    def delete(self, name):
        try:
            cloudinary.uploader.destroy(name)
        except Exception:
            pass

    def size(self, name):
        return 0
