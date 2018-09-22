from django.db import models


class Well(models.Model):
    name = models.CharField(max_length=50)
    api_no = models.CharField(max_length=50, blank=True)
    depth_units = models.CharField(max_length=50, default='Feet')
    width_units = models.CharField(max_length=50, default='Inches')

    def __str__(self):
        return self.name


class WellOrientation(models.Model):
    # e.g., sidetrack, vertical, horiz
    orientation = models.CharField(max_length=50)

    def __str__(self):
        return self.orientation

class Track(models.Model):
    well = models.ForeignKey(Well, on_delete=models.CASCADE)
    index = models.IntegerField()
    parent_track = models.IntegerField(null=True, blank=True)
    parent_depth = models.FloatField(null=True, blank=True)
    measured_depth = models.FloatField()
    orientation = models.ForeignKey(WellOrientation, on_delete=models.CASCADE)
    kick_off_point = models.FloatField(null=True, blank=True)
    true_vertical_depth = models.FloatField(null=True, blank=True)

    def __str__(self):
        return str(self.index)

class BoreHole(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    diameter = models.FloatField(null=True, blank=True)
    depth = models.FloatField()

class Casing(models.Model):
    name = models.CharField(max_length=200)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    od_size = models.FloatField(null=True, blank=True)
    set_depth = models.FloatField()
    top_depth = models.FloatField(default=0) # incase partially left in hole

class CsgCement(models.Model):
    name = models.CharField(max_length=200)
    casing = models.ForeignKey(Casing, on_delete=models.CASCADE)
    top_depth = models.FloatField()
    bottom_depth = models.FloatField()

class Tubular(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, blank=True)
    set_depth = models.FloatField()

class Perforation(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    top_depth = models.FloatField()
    bottom_depth = models.FloatField()
    penetrates_cement = models.BooleanField(default=True)
