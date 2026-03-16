from flask import Flask

app = Flask(__name__)

app.secret_key = "super_secret_key_here"  # TODO kies een betere key, een key is nodig om session te gebruiken
from app import routes