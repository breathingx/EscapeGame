from flask import render_template, redirect, url_for, send_file
from app import app
from qr import generate_QR

Reset = False #variable indicating the status of the reset-button

def shouldReset():
    global Reset
    if Reset:
        Reset = False #reinitialize 
        return redirect(url_for('start')) #page to go to after resetting
    return None

###-----------------QR-deployment and Resetter-function-------------------###

@app.route('/') #QR-page is the root-page, for the host
@app.route('/qr', methods=['GET', 'POST'])
def deploy_qr():
    return render_template('qr.html')

@app.route('/reset', methods=['POST'])
def reset():
    global Reset 
    Reset = True #set the global reset variable true to reset all teams
    return redirect(url_for('deploy_qr')) #if the reset-button is pressed, the host should keep being on the same page

@app.route('/qr.png', methods=['GET'])
def qr_creation():
    return send_file(generate_QR(), mimetype='image/png')

###-----------------Page-routing-------------------###

@app.route('/start', methods=['GET'])
def start():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    return render_template('start.html')

@app.route('/home', methods=['GET'])
def home():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    return render_template('home.html')

@app.route('/game', methods=['GET'])
def game():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    return render_template('game.html')

@app.route('/codes', methods=['GET'])
def codes():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    return render_template('codes.html')

@app.route('/resultaat', methods=['GET'])
def resultaat():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    return render_template('resultaat.html')