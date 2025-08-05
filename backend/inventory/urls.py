from django.urls import path
from .views import (
    TeaListView, TeaDetailView, SaleListCreateView, 
    LoginView, reports_view, dashboard_stats
)

app_name = 'inventory'

urlpatterns = [
    # Tea endpoints
    path('teas/', TeaListView.as_view(), name='tea-list'),
    path('teas/<int:pk>/', TeaDetailView.as_view(), name='tea-detail'),
    
    # Sales endpoints
    path('sales/', SaleListCreateView.as_view(), name='sale-list-create'),
    
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    
    # Reports endpoints
    path('reports/', reports_view, name='reports'),
    path('dashboard/', dashboard_stats, name='dashboard'),
] 