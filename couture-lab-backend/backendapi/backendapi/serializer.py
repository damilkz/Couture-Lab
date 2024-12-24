from django.contrib.auth import get_user_model
from rest_framework import serializers
from backendapi.models import ImageModel


User = get_user_model()

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageModel
        fields = ['id', 'image']


class AISerializer(serializers.Serializer):
    text = serializers.CharField()