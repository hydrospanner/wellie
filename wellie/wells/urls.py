from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('well/<int:pk>/', views.well_detail, name='well_detail'),
]

