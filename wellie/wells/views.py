from django.shortcuts import render

from .models import Well


def index(request):
    wells = Well.objects.all()
    context = {'wells': wells}
    return render(request, 'wells/index.html', context)

def get_child_fields_as_dict(fields, well):
    fields = {'well': ['track']}
    pass

def well_detail(request, pk):
    well = Well.objects.get(pk=pk)
    well_dict = well.__dict__
    print(well_dict)
    tracks = well.track_set.all()
    print([track.__dict__ for track in tracks])
    context = {'well': well}
    return render(request, 'wells/well_detail.html', context)