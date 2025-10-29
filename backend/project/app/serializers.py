from rest_framework import serializers
from .models import User, Notes
# serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

import re

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    profile_pic = serializers.ImageField(required=False, allow_null=True)
    profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'contact_number', 'gender',
            'state', 'country', 'profile_pic', 'password', 'confirm_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def get_profile_pic_url(self, obj):
        """
        Returns full URL if profile_pic exists, else None.
        """
        request = self.context.get('request')
        if obj.profile_pic:
            return request.build_absolute_uri(obj.profile_pic.url)
        return None

    # ---------- CREATE VALIDATION ----------
    def validate(self, data):
        # Validate first and last name — must not contain numbers
        if not data.get('first_name').isalpha():
            raise serializers.ValidationError({"first_name": "First name must only contain alphabets."})
        if not data.get('last_name').isalpha():
            raise serializers.ValidationError({"last_name": "Last name must only contain alphabets."})

        # Convert to lowercase before saving
        data['first_name'] = data['first_name'].lower()
        data['last_name'] = data['last_name'].lower()

        # Email lowercase normalization
        if 'email' in data:
            data['email'] = data['email'].lower()

        # Validate contact number
        contact = data.get('contact_number')
        if contact:
            if not re.match(r'^[6-9]\d{9}$', contact):
                raise serializers.ValidationError({
                    "contact_number": "Invalid phone number. Must start with 6,7,8,9 and be 10 digits."
                })

        # Password validation — 4 to 8 characters, alphanumeric only
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        if not re.match(r'^[A-Za-z0-9]{4,8}$', password):
            raise serializers.ValidationError({
                "password": "Password must be 4–8 characters long and alphanumeric only (no special chars)."
            })

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        profile_pic = validated_data.pop('profile_pic', None)

        user = User(**validated_data)
        user.set_password(validated_data['password'])
        if profile_pic:
            user.profile_pic = profile_pic
        user.save()
        return user

    # ---------- UPDATE VALIDATION ----------
    def update(self, instance, validated_data):
        # Convert names and email to lowercase
        if 'first_name' in validated_data:
            first_name = validated_data['first_name']
            if not first_name.isalpha():
                raise serializers.ValidationError({"first_name": "First name must only contain alphabets."})
            instance.first_name = first_name.lower()

        if 'last_name' in validated_data:
            last_name = validated_data['last_name']
            if not last_name.isalpha():
                raise serializers.ValidationError({"last_name": "Last name must only contain alphabets."})
            instance.last_name = last_name.lower()

        if 'email' in validated_data:
            instance.email = validated_data['email'].lower()

        if 'contact_number' in validated_data:
            contact = validated_data['contact_number']
            if not re.match(r'^[6-9]\d{9}$', contact):
                raise serializers.ValidationError({
                    "contact_number": "Invalid phone number. Must start with 6,7,8,9 and be 10 digits."
                })
            instance.contact_number = contact

        # Handle profile pic only if provided
        if 'profile_pic' in validated_data:
            profile_pic = validated_data['profile_pic']
            if profile_pic:
                instance.profile_pic = profile_pic

        # Password change (optional during update)
        if 'password' in validated_data:
            password = validated_data['password']
            if not re.match(r'^[A-Za-z0-9]{4,8}$', password):
                raise serializers.ValidationError({
                    "password": "Password must be 4–8 characters long and alphanumeric only."
                })
            instance.set_password(password)

        # Other simple fields
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

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims 
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user info into response
        request = self.context.get('request')
        profile_pic_url = (
            request.build_absolute_uri(self.user.profile_pic.url)
            if self.user.profile_pic else None
        )

        data.update({
            "id": self.user.id,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "profile_pic": profile_pic_url,
        })
        return data
