from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Tea(models.Model):
    """Tea model with name, category, and price"""
    
    CATEGORY_CHOICES = [
        ('Black', 'Black Tea'),
        ('Green', 'Green Tea'),
        ('White', 'White Tea'),
        ('Oolong', 'Oolong Tea'),
        ('Herbal', 'Herbal Tea'),
        ('Flavored', 'Flavored Tea'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Tea'
        verbose_name_plural = 'Teas'
    
    def __str__(self):
        return f"{self.name} ({self.category})"
    
    @property
    def is_in_stock(self):
        return self.stock_quantity > 0


class Sale(models.Model):
    """Sale model to record tea sales"""
    
    tea = models.ForeignKey(Tea, on_delete=models.CASCADE, related_name='sales')
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    sold_at = models.DateTimeField(default=timezone.now)
    sold_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sales')
    customer_name = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-sold_at']
        verbose_name = 'Sale'
        verbose_name_plural = 'Sales'
    
    def __str__(self):
        return f"{self.quantity}x {self.tea.name} - {self.total_amount}"
    
    def save(self, *args, **kwargs):
        # Calculate total amount if not provided
        if not self.total_amount:
            self.total_amount = self.quantity * self.unit_price
        
        # Set unit_price from tea price if not provided
        if not self.unit_price:
            self.unit_price = self.tea.price
            self.total_amount = self.quantity * self.unit_price
            
        super().save(*args, **kwargs)
        
        # Update stock quantity
        if self.pk:  # Only update stock for existing sales
            self.tea.stock_quantity = max(0, self.tea.stock_quantity - self.quantity)
            self.tea.save()


class UserProfile(models.Model):
    """Extended user profile for additional user information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ('manager', 'Manager'),
            ('cashier', 'Cashier'),
            ('admin', 'Admin'),
        ],
        default='cashier'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"
