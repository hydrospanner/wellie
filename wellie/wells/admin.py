from django.contrib import admin

# Register your models here.
from .models import WellOrientation, Well

admin.site.register(WellOrientation)
admin.site.register(Well)
