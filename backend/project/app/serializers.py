from rest_framework import serializers
from .models import User, Notes
# serializers.py
from rest_framework import serializers
import re


class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    # Allow uploads when creating/updating
    profile_pic = serializers.ImageField(required=False, allow_null=True, write_only=True)
    # Add separate read-only field for full URL
    profile_pic_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'contact_number', 'gender',
            'state', 'country', 'profile_pic', 'profile_pic_url',
            'password', 'confirm_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    # ---------- PROFILE PIC URL (READ-ONLY) ----------
    def get_profile_pic_url(self, obj):
        request = self.context.get('request')
        if obj.profile_pic:
            return request.build_absolute_uri(obj.profile_pic.url)
        return None

    # ---------- VALIDATION ----------
    def validate(self, data):
        # Names validation
        if not data.get('first_name', '').isalpha():
            raise serializers.ValidationError({"first_name": "First name must only contain alphabets."})
        if not data.get('last_name', '').isalpha():
            raise serializers.ValidationError({"last_name": "Last name must only contain alphabets."})

        # Normalize to lowercase
        data['first_name'] = data['first_name'].lower()
        data['last_name'] = data['last_name'].lower()

        # Normalize email
        if 'email' in data:
            data['email'] = data['email'].lower()

        # Contact validation
        contact = data.get('contact_number')
        if contact and not re.match(r'^[6-9]\d{9}$', contact):
            raise serializers.ValidationError({
                "contact_number": "Invalid phone number. Must start with 6,7,8,9 and be 10 digits."
            })

        # Password validation
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if not re.match(r'^[A-Za-z0-9]{4,8}$', password):
            raise serializers.ValidationError({
                "password": "Password must be 4–8 characters long and alphanumeric only (no special chars)."
            })

        return data

    # ---------- CREATE ----------
    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        profile_pic = validated_data.pop('profile_pic', None)

        user = User(**validated_data)
        user.set_password(validated_data['password'])
        if profile_pic:
            user.profile_pic = profile_pic
        user.save()
        return user

    # ---------- UPDATE ----------
    def update(self, instance, validated_data):
        validated_data.pop('confirm_password', None)
        if 'first_name' in validated_data:
            instance.first_name = validated_data['first_name'].lower()
        if 'last_name' in validated_data:
            instance.last_name = validated_data['last_name'].lower()
        if 'email' in validated_data:
            instance.email = validated_data['email'].lower()

        if 'contact_number' in validated_data:
            contact = validated_data['contact_number']
            if not re.match(r'^[6-9]\d{9}$', contact):
                raise serializers.ValidationError({
                    "contact_number": "Invalid phone number. Must start with 6,7,8,9 and be 10 digits."
                })
            instance.contact_number = contact

        # Password update
        if 'password' in validated_data:
            password = validated_data['password']
            if not re.match(r'^[A-Za-z0-9]{4,8}$', password):
                raise serializers.ValidationError({
                    "password": "Password must be 4–8 characters long and alphanumeric only."
                })
            instance.set_password(password)

        # Handle new profile picture
        if 'profile_pic' in validated_data:
            instance.profile_pic = validated_data['profile_pic']

        # Other fields
        for field in ['gender', 'state', 'country']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        instance.save()
        return instance

class NotesSerializer(serializers.ModelSerializer):
    created_at = serializers.DateField(read_only=True)

    class Meta:
        model = Notes
        fields = "__all__"
        read_only_fields = ["user"]





from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        return token

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # Authenticate user using email instead of username
        user = authenticate(request=self.context.get('request'), email=email, password=password)
        if not user:
            raise serializers.ValidationError({"detail": "Invalid email or password"})

        # Manually run parent validation after successful authentication
        data = super().validate(attrs)

        request = self.context.get('request')
        profile_pic_url = (
            request.build_absolute_uri(user.profile_pic.url)
            if getattr(user, "profile_pic", None) else None
        )

        data.update({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile_pic": profile_pic_url,
        })
        return data