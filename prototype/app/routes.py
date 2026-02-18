from flask import render_template, request, redirect, url_for, session, flash, jsonify
from app import app
from datetime import datetime

@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    if 'team' in session:
        return redirect(url_for('teamGekozen'))

    return render_template('index.html')

@app.route('/join_team', methods=['POST'])
def join_team():
    if 'team' not in session:
        team_num = int(request.form['team'])
        session['team'] = team_num

    return redirect(url_for('teamGekozen'))


@app.route('/teamGekozen', methods=['GET', 'POST'])
def teamGekozen():
    if 'team' not in session:
        return redirect(url_for('index'))

    teamNum = session['team']
    session['started'] = False

    allTeams = [1, 2, 3]
    otherTeams = [t for t in allTeams if t != teamNum]
    other_text = " en ".join(f"team {t}" for t in otherTeams)

    return render_template('teamGekozen.html', otherTeamsText=other_text, started=session['started'])

@app.route('/resetTeam', methods=['POST'])
def resetTeam():
    session.clear()
    flash("Your team has been reset.")
    return redirect(url_for('index'))

@app.route('/addPenalty', methods=['POST'])
def addPenalty():
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
    return render_template('end.html', penalty=session['penalty'])
