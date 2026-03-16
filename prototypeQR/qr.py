import qrcode
from PIL import Image
import io
from io import BytesIO
from flask import send_file

def generate_QR(url="YOUR_IP:5000/index", logo_path="app/static/msk.jpg"):
    #Voor QR codes is het nodig dat de app daadwerkelijk op het web staat,
    #anders moet je het IP-adres van je apparaat gebruiken, alsvolgt: http://IP:5000/index
    #uiteindelijk zal hier uiteraard de index-pagina van de echte website komen te staan als link wanneer die website gedeployed is.
    qr = qrcode.QRCode(version=5, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(url) #redirect to index once scanned
    image = qr.make_image(fill_color="black", back_color="white")

    logo = Image.open(logo_path).convert("RGBA")
    logo_size = image.size[0] // 3 #resize image to fit the QR-box
    logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)

    logo_placement = ((image.size[0]-logo.size[0]) // 2, (image.size[1]-logo.size[1]) // 2) #center
    image.paste(logo, logo_placement, logo) #and paste the logo on the QR-box

    image_bytes = BytesIO()
    image.save(image_bytes, format='PNG')
    image_bytes.seek(0)
    return image_bytes