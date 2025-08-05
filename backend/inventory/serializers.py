from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Tea, Sale, UserProfile


class TeaSerializer(serializers.ModelSerializer):
    """Serializer for Tea model"""
    
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Tea
        fields = [
            'id', 'name', 'category', 'price', 'description', 
            'stock_quantity', 'is_in_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SaleSerializer(serializers.ModelSerializer):
    """Serializer for Sale model"""
    
    tea_name = serializers.CharField(source='tea.name', read_only=True)
    tea_category = serializers.CharField(source='tea.category', read_only=True)
    sold_by_username = serializers.CharField(source='sold_by.username', read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'tea', 'tea_name', 'tea_category', 'quantity', 
            'unit_price', 'total_amount', 'sold_at', 'sold_by', 
            'sold_by_username', 'customer_name', 'notes'
        ]
        read_only_fields = ['sold_at', 'sold_by', 'total_amount', 'unit_price']
    
    def validate_quantity(self, value):
        """Validate that quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate(self, data):
        """Validate that tea has sufficient stock"""
        tea = data.get('tea')
        quantity = data.get('quantity')
        
        if tea and quantity:
            if tea.stock_quantity < quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock. Available: {tea.stock_quantity}, Requested: {quantity}"
                )
        
        return data


class SaleCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating sales"""
    
    class Meta:
        model = Sale
        fields = ['tea', 'quantity', 'customer_name', 'notes']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'phone_number', 'role', 'created_at'
        ]


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid username or password')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return data


class SalesReportSerializer(serializers.Serializer):
    """Serializer for sales reports"""
    
    date = serializers.DateField()
    total_sales = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_quantity = serializers.IntegerField()
    tea_count = serializers.IntegerField()


class CategoryReportSerializer(serializers.Serializer):
    """Serializer for category-wise sales reports"""
    
    category = serializers.CharField()
    total_sales = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_quantity = serializers.IntegerField()
    tea_count = serializers.IntegerField() 