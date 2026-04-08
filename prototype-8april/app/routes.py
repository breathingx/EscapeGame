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

@app.route('/') #root-page for the host
@app.route('/host', methods=['GET', 'POST'])
def host():
    return render_template('host.html')

@app.route('/reset', methods=['POST'])
def reset():
    global Reset 
    Reset = True #set the global reset variable true to reset all teams
    return redirect(url_for('host')) #if the reset-button is pressed, the host should keep being on the same page

@app.route('/qr/team/<team>.png', methods=['GET'])
def qr_creation(team):
    teams = ['aandrijving', 'programma', 'klankbron']
    if team not in teams:
        return "Error: Team not found!", 404
    return send_file(generate_QR(f"JOUW_IP_ADRES_HIER:5000/initiate/{team}"), mimetype='image/png') #pass the team to the QR-page for correct redirection
    
    #NOTITIE: Voor QR codes is het nodig dat de app daadwerkelijk op het web staat,
    #anders moet je het IP-adres van je apparaat gebruiken.
    #uiteindelijk zal hier uiteraard de start-pagina van de echte website komen te staan als link wanneer die website gedeployed is.

@app.route('/teams', methods=['GET'])
def teams():
    return render_template('teams.html')

@app.route('/qr/<team>', methods=['GET']) #routing for the QR-code per team, on the hosts page
def qr(team):
    return render_template('qr.html', team=team)

###-----------------Page-routing-------------------###

@app.route('/start', methods=['GET'])
def start():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    return render_template('start.html')

@app.route('/initiate/<team>', methods=['GET'])
def initiate(team):
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    return render_template('initiate.html', team=team)

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