from django.db import models


class Well(models.Model):
    name = models.CharField(max_length=50)
    api_no = models.CharField(max_length=50)
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
    parent_track = models.IntegerField()
    parent_depth = models.FloatField()
    measured_depth = models.FloatField()
    orientation = models.ForeignKey(WellOrientation, on_delete=models.CASCADE)
    kick_off_point = models.FloatField()
    true_vertical_depth = models.FloatField()

    def __str__(self):
        return self.index

class BoreHole(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    diameter = models.FloatField()
    depth = models.FloatField()

class Casing(models.Model):
    name = models.CharField(max_length=200)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    od_size = models.FloatField()
    set_depth = models.FloatField()
    top_depth = models.FloatField(default=0) # incase partially left in hole

class CsgCement(models.Model):
    name = models.CharField(max_length=200)
    casing = models.ForeignKey(Casing, on_delete=models.CASCADE)
    top_depth = models.FloatField()
    bottom_depth = models.FloatField()

class Tubular(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    set_depth = models.FloatField()

class Perforation(models.Model):
    casing = models.ForeignKey(Casing, on_delete=models.CASCADE)
    top_depth = models.FloatField()
    bottom_depth = models.FloatField()
