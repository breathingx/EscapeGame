from flask import render_template, request, redirect, url_for, session, flash, jsonify, send_file
from app import app
from datetime import datetime
from qr import generate_QR

Reset = False 

def shouldReset():
    global Reset
    if Reset:
        Reset = False #reinitialize 
        session.clear()
        return redirect(url_for('index')) #page to go to after resetting
    return None

@app.route('/', methods=['GET', 'POST'])
@app.route('/qr', methods=['GET', 'POST'])
def deploy_qr():
    return render_template('qr.html')

@app.route('/reset', methods=['POST'])
def reset():
    global Reset 
    Reset = True #set the global reset variable true to reset all teams
    return redirect(url_for('deploy_qr')) #if the reset-button is pressed, the host should keep being on the same page

@app.route('/index', methods=['GET'])
def index():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    session.clear()
    return render_template('index.html')

@app.route('/join_team', methods=['POST'])
def join_team():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    if 'team' not in session:
        team_num = int(request.form['team'])
        session['team'] = team_num

    return redirect(url_for('teamGekozen'))

@app.route('/teamGekozen', methods=['GET', 'POST'])
def teamGekozen():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    if 'team' not in session:
        return redirect(url_for('index'))

    teamNum = session['team']
    session['started'] = False

    allTeams = [1, 2, 3]
    otherTeams = [t for t in allTeams if t != teamNum]
    other_text = " en ".join(f"team {t}" for t in otherTeams)

    return render_template('teamGekozen.html', otherTeamsText=other_text, started=session['started'])

@app.route('/addPenalty', methods=['POST']) 
def addPenalty():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    if 'penalty' not in session:
        session['penalty'] = 0
    session['penalty'] += 1

    penVal = session['penalty']
    print("waarde penalty in flask: " + str(penVal))
    return "", 204

@app.route('/getPenaltyCurrentPuzzle', methods=['GET'])
def getPenaltyCurrentPuzzle():
    penalty = session.get('penalty', 0)
    return jsonify({"penalty": penalty})

@app.route('/puzzelEen', methods=['GET', 'POST'])
def puzzelEen():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    session['started'] = True
    if request.method == 'POST':
        client_timestamp = request.form.get("beginTijd")
        if client_timestamp:
            session['beginTijd'] = float(client_timestamp)
        else:
            session['beginTijd'] = datetime.utcnow().timestamp()
        session['penalty'] = 0

    return render_template('puzzelEen.html', started = session['started'])

@app.route('/end.html', methods=['GET', 'POST'])
def endHtml():
    if redirectWhere := shouldReset(): #perhaps a reset occurred and it should redirect to somewhere from here
        return redirectWhere
    return render_template('end.html', penalty=session['penalty'])

@app.route('/qr.png', methods=['GET'])
def qr_creation():
    return send_file(generate_QR(), mimetype='image/png')