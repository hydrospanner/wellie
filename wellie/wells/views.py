from django.shortcuts import render
import json
from django.db.models.fields.related import ManyToManyField

from .models import Well


def index(request):
    wells = Well.objects.all()
    context = {'wells': wells}
    return render(request, 'wells/index.html', context)


def to_dict(instance):
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


def get_child_fields_as_dict(well):
    # well_dict = well.__dict__
    well_dict = to_dict(well)
    tracks = well.track_set.all()
    well_dict['tracks'] = [to_dict(track) for track in tracks]

    return well_dict

def well_detail(request, pk):
    well = Well.objects.get(pk=pk)
    well_dict = get_child_fields_as_dict(well)
    print(well_dict)
    context = {'well': well, 'well_data': json.dumps(well_dict)}
    return render(request, 'wells/well_detail.html', context)