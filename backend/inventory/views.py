from django.shortcuts import render
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
# Import F for the category report
from django.db.models import F

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Tea, Sale, UserProfile
from .serializers import (
    TeaSerializer, SaleSerializer, SaleCreateSerializer, 
    LoginSerializer, SalesReportSerializer, CategoryReportSerializer,
    UserProfileSerializer
)


class TeaListView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating teas.
    Supports filtering by category: /api/teas/?category=Black
    """
    queryset = Tea.objects.all()
    serializer_class = TeaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Tea.objects.all()
        category = self.request.query_params.get('category', None)
        
        if category is not None:
            queryset = queryset.filter(category__iexact=category)
        
        # Additional filters
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        in_stock_only = self.request.query_params.get('in_stock', None)
        if in_stock_only and in_stock_only.lower() == 'true':
            queryset = queryset.filter(stock_quantity__gt=0)
            
        return queryset


class TeaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for individual tea operations"""
    queryset = Tea.objects.all()
    serializer_class = TeaSerializer
    permission_classes = [IsAuthenticated]


class SaleListCreateView(generics.ListCreateAPIView):
    """
    API endpoint for listing sales and recording new sales.
    POST /api/sales/ with tea ID and quantity to record a sale.
    """
    queryset = Sale.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SaleCreateSerializer
        return SaleSerializer
    
    def perform_create(self, serializer):
        # Set the user who made the sale
        tea = serializer.validated_data['tea']
        quantity = serializer.validated_data['quantity']
        
        # Set unit price from tea price and calculate total
        unit_price = tea.price
        total_amount = quantity * unit_price
        
        sale = serializer.save(
            sold_by=self.request.user,
            unit_price=unit_price,
            total_amount=total_amount
        )
        
        # Update tea stock
        tea.stock_quantity = max(0, tea.stock_quantity - quantity)
        tea.save()
        
        return sale
    
    def get_queryset(self):
        queryset = Sale.objects.all()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(sold_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(sold_at__date__lte=end_date)
        
        # Filter by tea category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(tea__category__iexact=category)
            
        return queryset


class LoginView(APIView):
    """
    API endpoint for user authentication.
    POST /api/login/ with username and password to get JWT tokens.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            # Get or create user profile
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': profile.role,
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reports_view(request):
    """
    API endpoint for various reports.
    GET /api/reports/ returns daily sales, category sales, and other analytics.
    """
    
    # Get query parameters
    report_type = request.query_params.get('type', 'daily')
    start_date = request.query_params.get('start_date', None)
    end_date = request.query_params.get('end_date', None)
    
    # Default to last 30 days if no dates provided
    if not end_date:
        end_date = timezone.now().date()
    else:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    if not start_date:
        start_date = end_date - timedelta(days=30)
    else:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    
    if report_type == 'daily':
        # Daily sales report
        daily_sales = Sale.objects.filter(
            sold_at__date__range=[start_date, end_date]
        ).extra(
            select={'date': 'DATE(sold_at)'}
        ).values('date').annotate(
            total_sales=Sum('total_amount'),
            total_quantity=Sum('quantity'),
            tea_count=Count('tea', distinct=True)
        ).order_by('date')
        
        return Response({
            'type': 'daily_sales',
            'start_date': start_date,
            'end_date': end_date,
            'data': daily_sales
        })
    
    elif report_type == 'category':
        # Category-wise sales report
        category_sales = Sale.objects.filter(
            sold_at__date__range=[start_date, end_date]
        ).values('tea__category').annotate(
            category=F('tea__category'),
            total_sales=Sum('total_amount'),
            total_quantity=Sum('quantity'),
            tea_count=Count('tea', distinct=True)
        ).order_by('-total_sales')
        
        return Response({
            'type': 'category_sales',
            'start_date': start_date,
            'end_date': end_date,
            'data': category_sales
        })
    
    elif report_type == 'summary':
        # Summary report
        total_sales = Sale.objects.filter(
            sold_at__date__range=[start_date, end_date]
        ).aggregate(
            total_amount=Sum('total_amount'),
            total_quantity=Sum('quantity'),
            total_transactions=Count('id')
        )
        
        # Top selling teas
        top_teas = Sale.objects.filter(
            sold_at__date__range=[start_date, end_date]
        ).values('tea__name', 'tea__category').annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('total_amount')
        ).order_by('-total_sold')[:10]
        
        # Low stock alerts
        low_stock_teas = Tea.objects.filter(stock_quantity__lt=10).values(
            'name', 'category', 'stock_quantity'
        )
        
        return Response({
            'type': 'summary',
            'start_date': start_date,
            'end_date': end_date,
            'totals': total_sales,
            'top_teas': top_teas,
            'low_stock_alerts': low_stock_teas
        })
    
    else:
        return Response(
            {'error': 'Invalid report type. Use: daily, category, or summary'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    API endpoint for dashboard statistics.
    GET /api/dashboard/ returns key metrics for the dashboard.
    """
    today = timezone.now().date()
    this_month = today.replace(day=1)
    
    # Today's stats
    today_stats = Sale.objects.filter(sold_at__date=today).aggregate(
        sales_count=Count('id'),
        revenue=Sum('total_amount'),
        quantity_sold=Sum('quantity')
    )
    
    # This month's stats
    month_stats = Sale.objects.filter(sold_at__date__gte=this_month).aggregate(
        sales_count=Count('id'),
        revenue=Sum('total_amount'),
        quantity_sold=Sum('quantity')
    )
    
    # Inventory stats
    inventory_stats = Tea.objects.aggregate(
        total_teas=Count('id'),
        total_stock=Sum('stock_quantity'),
        low_stock_count=Count('id', filter=Q(stock_quantity__lt=10))
    )
    
    return Response({
        'today': today_stats,
        'this_month': month_stats,
        'inventory': inventory_stats,
        'date': today
    })


