from django.contrib.auth import get_user_model
from rest_framework.generics import GenericAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from backendapi.serializer import RegisterSerializer, LoginSerializer, EmailVerificationSerializer
from backendapi.models import UserManager
from django.core.mail import send_mail
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
import jwt

User = get_user_model()

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    objects = UserManager()
    
    def post(self, request):
        user = request.data
        serializer = self.serializer_class(data=user)
        serializer.is_valid(raise_exception=True)
        # Saves the validated serializer, which creates a new user
        serializer.save()
        # Gets serialized data of the new user
        user_data = serializer.data
        # Retrieves user object from database using email
        user=User.objects.get(email=user_data['email']) 
        tokens = RefreshToken.for_user(user).access_token
        
        # Send email for user verification
        current_site = get_current_site(request).domain
        relative_link = reverse('email-verify')
        absurl = 'http://'+ current_site + relative_link + "?token=" + str(tokens)
        email_body = (
            'Hey,\n\n'
            'Thank you for joining CoutureLab. Use the link below to verify your email: \n\n'
            + absurl + '\n\n'
            'Didn\'t verify? Feel free to ignore this email then.\n\n'
            'Thanks,\n'
            'CoutureLab'
        )
        data = {'email_body': email_body, 'to_email': user.email,
                'email_subject': 'Verify your email'}

        recipient_list = [user.email]

        send_mail(data['email_subject'], data['email_body'], data['to_email'], recipient_list, fail_silently=False)

        return Response(user_data, status=status.HTTP_201_CREATED)


class LoginView(GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)