# Notes Taking App — Full Stack 

A full-stack Notes Taking Application built with **React (frontend)** and **Django REST Framework (backend)**.  
Users can register, log in using JWT authentication, manage their profiles (with profile pictures), and create, edit, or delete notes.

---

## Project Structure
 <!-- Steps -->
 ```bash
git clone https://github.com/yourusername/NotesTakingApp.git
cd NotesTakingApp

# stand at backend 
cd backend

# create enviroment and activate it
python -m venv env
env\Scripts\activate

# install requirements
pip install -r requirements.txt


# apply migrations
python manage.py makemigrations
python manage.py migrate

# run server
py manage.py runserver
