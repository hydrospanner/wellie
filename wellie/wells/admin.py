from django.contrib import admin

from .models import WellOrientation, Well, Track, BoreHole, Casing, CsgCement, Perforation, Tubular

class CsgCementInline(admin.TabularInline):
    model = CsgCement

class PerforationInline(admin.TabularInline):
    model = Perforation

class CasingAdmin(admin.ModelAdmin):
    inlines = [
        CsgCementInline,
        ]

class BoreHoleInline(admin.TabularInline):
    model = BoreHole

class TubularInline(admin.TabularInline):
    model = Tubular
    extra = 1

class TrackAdmin(admin.ModelAdmin):
    inlines = [
        BoreHoleInline,
        TubularInline,
        PerforationInline,
    ]

class TrackInline(admin.TabularInline):
    model = Track
    extra = 2

class WellAdmin(admin.ModelAdmin):
    inlines = [
        TrackInline,
    ]

admin.site.register(WellOrientation)
admin.site.register(Well, WellAdmin)
admin.site.register(Casing, CasingAdmin)
admin.site.register(Track, TrackAdmin)
