from django.shortcuts import render
import json
from django.db.models.fields.related import ManyToManyField

from .models import Well


def index(request):
    wells = Well.objects.all()
    context = {'wells': wells}
    return render(request, 'wells/index.html', context)


def to_dict(instance):
    # transform model object to dictionary. 
    opts = instance._meta
    data = {}
    for f in opts.concrete_fields + opts.many_to_many:
        if isinstance(f, ManyToManyField):
            if instance.pk is None:
                data[f.name] = []
            else:
                data[f.name] = list(f.value_from_object(instance).values_list('pk', flat=True))
        else:
            data[f.name] = f.value_from_object(instance)
    return data

def calc_track_coords(track):
    track_coords = [{'x': 0, 'y': 0}]
    if track['orientation'].lower() == 'vertical':
        track_coords.append({'x': 0, 'y': track['measured_depth']})
    elif track['orientation'].lower() == 'horizontal':
        track_coords.append({'x': 0, 'y': track['kick_off_point']})
        track_coords.append({'x': track['true_vertical_depth'], 'y': track['measured_depth'] - track['kick_off_point']})
    return track_coords


def get_child_fields_as_dict(well):
    well_dict = to_dict(well)
    tracks = well.track_set.all()
    tracks_dict = []
    for track in tracks:
        track_dict = to_dict(track)
        track_dict['orientation'] = track.orientation.orientation
        tracks_dict.append(track_dict)
    for track in tracks_dict:
        track['track_coords'] = calc_track_coords(track)
    well_dict['tracks'] = tracks_dict
    for track, track_dict in zip(tracks, well_dict['tracks']):
        bore_holes = track.borehole_set.all()
        track_dict['bore_holes'] = [to_dict(bh) for bh in bore_holes]
        casings = track.casing_set.all().order_by('-set_depth')
        casings_dict = []
        for csg in casings:
            csg_dict = to_dict(csg)
            cements = csg.csgcement_set.all()
            csg_dict['cement'] = [to_dict(cmt) for cmt in cements]
            casings_dict.append(csg_dict)
        track_dict['casing'] = casings_dict
    return well_dict

def well_detail(request, pk):
    well = Well.objects.get(pk=pk)
    well_dict = get_child_fields_as_dict(well)
    track1 = well_dict['tracks'][0]
    context = {'well': well, 
               'track_coords': json.dumps(track1['track_coords']),
               'casing_arr': json.dumps(track1['casing']),
               'bore_hole_arr': json.dumps(track1['bore_holes']),
               }
    return render(request, 'wells/well_detail.html', context)