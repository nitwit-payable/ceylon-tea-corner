from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from inventory.models import Tea, UserProfile
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate the database with sample tea data and create test users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Tea.objects.all().delete()
            
        # Create sample teas
        sample_teas = [
            {
                'name': 'Ceylon Orange Pekoe',
                'category': 'Black',
                'price': Decimal('450.00'),
                'description': 'Premium black tea from the highlands of Sri Lanka',
                'stock_quantity': 100
            },
            {
                'name': 'Earl Grey Ceylon',
                'category': 'Black',
                'price': Decimal('520.00'),
                'description': 'Classic Earl Grey with Ceylon black tea base',
                'stock_quantity': 75
            },
            {
                'name': 'Ceylon Green Tea',
                'category': 'Green',
                'price': Decimal('380.00'),
                'description': 'Fresh green tea with a light, refreshing taste',
                'stock_quantity': 50
            },
            {
                'name': 'Jasmine Green Tea',
                'category': 'Green',
                'price': Decimal('420.00'),
                'description': 'Green tea scented with jasmine flowers',
                'stock_quantity': 60
            },
            {
                'name': 'Silver Tips White Tea',
                'category': 'White',
                'price': Decimal('850.00'),
                'description': 'Delicate white tea with subtle flavor',
                'stock_quantity': 25
            },
            {
                'name': 'Ceylon Oolong',
                'category': 'Oolong',
                'price': Decimal('650.00'),
                'description': 'Semi-fermented tea with complex flavor profile',
                'stock_quantity': 40
            },
            {
                'name': 'Chamomile Herbal',
                'category': 'Herbal',
                'price': Decimal('320.00'),
                'description': 'Caffeine-free chamomile flowers for relaxation',
                'stock_quantity': 80
            },
            {
                'name': 'Peppermint Herbal',
                'category': 'Herbal',
                'price': Decimal('290.00'),
                'description': 'Refreshing peppermint herbal tea',
                'stock_quantity': 70
            },
            {
                'name': 'Vanilla Ceylon Black',
                'category': 'Flavored',
                'price': Decimal('480.00'),
                'description': 'Ceylon black tea with natural vanilla flavoring',
                'stock_quantity': 55
            },
            {
                'name': 'Cinnamon Spice Tea',
                'category': 'Flavored',
                'price': Decimal('410.00'),
                'description': 'Spiced tea blend with cinnamon and other warming spices',
                'stock_quantity': 65
            },
            {
                'name': 'Lemon Ginger Herbal',
                'category': 'Herbal',
                'price': Decimal('350.00'),
                'description': 'Zesty lemon and warming ginger herbal blend',
                'stock_quantity': 45
            },
            {
                'name': 'Breakfast Blend',
                'category': 'Black',
                'price': Decimal('390.00'),
                'description': 'Strong morning blend perfect with milk',
                'stock_quantity': 90
            },
        ]

        created_count = 0
        for tea_data in sample_teas:
            tea, created = Tea.objects.get_or_create(
                name=tea_data['name'],
                defaults=tea_data
            )
            if created:
                created_count += 1
                self.stdout.write(f'Created tea: {tea.name}')
            else:
                self.stdout.write(f'Tea already exists: {tea.name}')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} tea varieties')
        )

        # Create test users if they don't exist
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@ceylonteacorner.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'password': 'admin123',
                'role': 'admin'
            },
            {
                'username': 'manager',
                'email': 'manager@ceylonteacorner.com',
                'first_name': 'Manager',
                'last_name': 'User',
                'password': 'manager123',
                'role': 'manager'
            },
            {
                'username': 'cashier',
                'email': 'cashier@ceylonteacorner.com',
                'first_name': 'Cashier',
                'last_name': 'User',
                'password': 'cashier123',
                'role': 'cashier'
            }
        ]

        users_created = 0
        for user_data in users_data:
            role = user_data.pop('role')
            password = user_data.pop('password')
            
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            
            if created:
                user.set_password(password)
                if user_data['username'] == 'admin':
                    user.is_staff = True
                    user.is_superuser = True
                user.save()
                users_created += 1
                self.stdout.write(f'Created user: {user.username}')
                
                # Create user profile
                profile, profile_created = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={'role': role}
                )
                if profile_created:
                    self.stdout.write(f'Created profile for: {user.username} with role: {role}')
            else:
                self.stdout.write(f'User already exists: {user.username}')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {users_created} users')
        )
        
        self.stdout.write(
            self.style.SUCCESS('Database population completed!')
        )
        self.stdout.write('You can now login with:')
        self.stdout.write('  Admin: admin/admin123')
        self.stdout.write('  Manager: manager/manager123')
        self.stdout.write('  Cashier: cashier/cashier123') 