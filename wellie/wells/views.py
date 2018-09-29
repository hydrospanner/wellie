from django.shortcuts import render
import json

from .models import Well
from .diagram_data import get_diagram_data_as_dict


def index(request):
    wells = Well.objects.all()
    context = {'wells': wells}
    return render(request, 'wells/index.html', context)


def well_detail(request, pk):
    well = Well.objects.get(pk=pk)
    well_dict = get_diagram_data_as_dict(well)
    track1 = well_dict['tracks'][0]
    context = {'well': well, 
               'track_coords': json.dumps(track1['track_coords']),
               'casing_arr': json.dumps(track1['casing']),
               'bore_hole_arr': json.dumps(track1['bore_holes']),
               }
    return render(request, 'wells/well_detail.html', context)
