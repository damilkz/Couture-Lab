from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken


class ImageModel(models.Model):
    image = models.ImageField(upload_to='images/')

class UserManager(BaseUserManager):
    def create_user(self, email, password, password2=None, **extra_fields):
        if not email:
            raise ValueError("User must have an email address")
        
        # Normalizes email address by making domain part (email.com/Email.com) to lowercase
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email=email, password=password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    objects = UserManager()
    username = None
    email = models.EmailField(_('email address'), unique=True)
    is_verified = models.BooleanField(default=False)

    # Django admin, deals with staff or superuser
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
    
    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }