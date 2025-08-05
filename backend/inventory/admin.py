from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Tea, Sale, UserProfile


@admin.register(Tea)
class TeaAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock_quantity', 'is_in_stock', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'price', 'description')
        }),
        ('Inventory', {
            'fields': ('stock_quantity',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('tea', 'quantity', 'unit_price', 'total_amount', 'sold_at', 'sold_by', 'customer_name')
    list_filter = ('sold_at', 'tea__category', 'sold_by')
    search_fields = ('tea__name', 'customer_name', 'sold_by__username')
    ordering = ('-sold_at',)
    readonly_fields = ('sold_at', 'total_amount')
    
    fieldsets = (
        ('Sale Information', {
            'fields': ('tea', 'quantity', 'customer_name', 'notes')
        }),
        ('Pricing', {
            'fields': ('unit_price', 'total_amount')
        }),
        ('Meta Information', {
            'fields': ('sold_by', 'sold_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ('tea', 'quantity', 'sold_by')
        return self.readonly_fields


# Inline admin for UserProfile
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False


# Extend User admin
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)


# Re-register User admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone_number', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone_number')
    readonly_fields = ('created_at',)


# Customize admin site
admin.site.site_header = "Ceylon Tea Corner Administration"
admin.site.site_title = "Ceylon Tea Corner Admin"
admin.site.index_title = "Welcome to Ceylon Tea Corner Administration"
