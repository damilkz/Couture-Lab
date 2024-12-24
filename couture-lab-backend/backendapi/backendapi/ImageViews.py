from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from backendapi.serializer import ImageSerializer
from backendapi.models import ImageModel
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.core.files.storage import default_storage
from google.cloud import storage
from google.auth.transport.requests import Request
from google.oauth2 import service_account
from datetime import timedelta
import base64

# views here

class GetImage(APIView):
    def get(self, request, image_name):
        # Path to your service account key file
        keyfile_path = 'couture-lab-backend\backendapi\backendapi\couture-lab-backend-55abe63283f2.json'

        # Specify the full path to the image in GCS
        bucket_name = 'couturelab-media'
        object_name = f'images/{image_name}'

        # Initialize a GCS client with a service account
        credentials = service_account.Credentials.from_service_account_file(
            keyfile_path, scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        client = storage.Client(credentials=credentials)

        # Get a reference to the GCS bucket
        bucket = client.bucket(bucket_name)

        # Get a reference to the GCS object
        blob = bucket.blob(object_name)

        # Download the binary content of the GCS object
        image_content = blob.download_as_bytes()

        # Convert the binary content to base64 if needed
        base64_content = base64.b64encode(image_content).decode('utf-8')

        # Return the image content as the HTTP response
        return Response(base64_content)


class StoreImage(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):

        serializer = ImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteImage(APIView):
    def delete(self, request):
        image = request.image
        if image is not None:
            image.delete()
            return Response("Deleted", status=status.HTTP_204_NO_CONTENT)
        return Response({'Error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)