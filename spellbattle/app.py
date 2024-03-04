import os

from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_session import Session
import random
import sqlite3
import time

# Configure application
app = Flask(__name__)

# setup sessions
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# DELETE THIS AFTER DEVELOPMENT
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

conn = None

dictconn = sqlite3.connect('dictionary.db')
cursor = dictconn.cursor()

dictionary = {length: set() for length in range(3, 15)}

# Query and store words for each word length (3-14)
for length in range(3, 15):
    cursor.execute("SELECT word FROM dictionary WHERE length = ?", (length,))
    words = cursor.fetchall()
    dictionary[length] = set(word[0].upper() for word in words if word[0] is not None)
dictconn.close()


def open_conn(retries=3, delay=1):
    global conn
    for _ in range(retries):
        try:
            conn = sqlite3.connect('nhwords.db', check_same_thread=False)
            return
        except sqlite3.Error as e:
            print(f"Database connection failed with error: {e}. Retrying...")
            time.sleep(delay)
    raise Exception("Error. Sorry, please try again.")

def query_nhwords(query, params=(), one=False):
    with conn:
        cur = conn.cursor()
        result = cur.execute(query, params).fetchall()
        cur.close()
    return (result[0] if result else None) if one else result

@app.route("/", methods=["GET", "POST"])
def setup():
    open_conn()

    grades = query_nhwords("SELECT DISTINCT grade FROM nhwords")
    units = query_nhwords("SELECT DISTINCT grade, unit FROM nhwords")
    lessons = query_nhwords("SELECT DISTINCT grade, unit, lesson FROM nhwords")

    conn.close()

    session['min_length'] = None
    session['max_length'] = None
    session['custom_words'] = None

    return render_template("setup.html", grades=grades, units=units, lessons=lessons)


@app.route('/get_word_lengths', methods=['POST'])
def get_word_lengths():
    data = request.json
    startTextbook = data['startPoint']['textbook']
    startUnit = data['startPoint']['unit']
    startLesson = data['startPoint']['lesson']

    endTextbook = data['endPoint']['textbook']
    endUnit = data['endPoint']['unit']
    endLesson = data['endPoint']['lesson']

    open_conn()

    # Query to get the starting ID
    startID = query_nhwords("""
        SELECT MIN(id)
        FROM nhwords
        WHERE grade = ? AND unit = ? AND lesson = ?;
    """, (startTextbook, startUnit, startLesson), one=True)[0]

    # Query to get the ending ID
    endID = query_nhwords("""
        SELECT MAX(id)
        FROM nhwords
        WHERE grade = ? AND unit = ? AND lesson = ?;
    """, (endTextbook, endUnit, endLesson), one=True)[0]

    # Query to get minimum and maximum word lengths between these IDs
    min_length, max_length = query_nhwords("""
        SELECT MIN(length), MAX(length)
        FROM nhwords
        WHERE id BETWEEN ? AND ?;
    """, (startID, endID), one=True)

    # Store the IDs in the session
    session['startID'] = startID
    session['endID'] = endID

    conn.close()

    return jsonify({"minLength": min_length, "maxLength": max_length})


@app.route('/pull_textbook_word', methods=['POST'])
def pull_textbook_word():
    startID = session.get('startID')
    endID = session.get('endID')

    if not session['min_length']:
        min_length = request.form.get('min_length')
        max_length = request.form.get('max_length')
        session['min_length'] = min_length
        session['max_length'] = max_length
    else:
        min_length = session['min_length']
        max_length = session['max_length']

    open_conn()

    wordlist = query_nhwords("""
        SELECT *
        FROM nhwords
        WHERE id BETWEEN ? AND ?
        AND length BETWEEN ? AND ?;
    """, (startID, endID, min_length, max_length))

    chosen_word = random.choice(wordlist)

    # Convert the chosen word tuple to a dictionary for easier access
    word_details = {
        "word": chosen_word[1],
        "length": chosen_word[2],
        "grade": chosen_word[4],
        "unit": chosen_word[5],
        "lesson": chosen_word[6],
        "page": chosen_word[7],
        "pos": chosen_word[8],
        "meaning": chosen_word[9]
    }

    session['word_details'] = word_details
    session['word_answer'] = chosen_word[1].upper()
    session['word_length'] = chosen_word[2]
    session['txb_bool'] = True

    conn.close()

    return redirect(url_for('play'))


@app.route('/pull_custom_word', methods=['POST'])
def pull_custom_word():
    if not session['custom_words']:
        words = request.form['custom_words']
        wordlist = words.split(',')
        session['custom_words'] = wordlist
    else:
        wordlist = session['custom_words']

    chosen_word = random.choice(wordlist)

    session['word_answer'] = chosen_word.upper()
    session['word_length'] = len(chosen_word)
    session['txb_bool'] = False

    return redirect(url_for('play'))


@app.route('/play')
def play():
    word_length = session.get('word_length')
    txb_bool = session.get('txb_bool')
    return render_template("play.html", word_length=word_length, txb_bool=txb_bool)


@app.route('/word_check', methods=['POST'])
def word_check():
    word = request.form['attempt']
    attempt = [{'letter': char, 'green': False, 'yellow': False} for char in word]
    gameScore = int(request.form['gameScore'])
    tries = int(request.form['tries'])
    answer = session['word_answer']
    answer_check = [{'letter': char, 'green': False, 'yellow': False} for char in answer]
    word_length = session['word_length']
    txb_bool = session['txb_bool']

    print("attempt: ", attempt)
    print("Answer: ", answer)
    print("gameScore: ", gameScore)

    if 'totalScore' not in session:
        session['totalScore'] = 0

    # If user's guess is correct, update total score and return success
    if word == answer:
        for item in attempt:
            item['green'] = True

        session['totalScore'] += gameScore

        if txb_bool:
            return jsonify({"status": "winGame", "totalScore": session['totalScore'], "attempt": attempt, "word_details": session['word_details']})
        else:
            return jsonify({"status": "winGame", "totalScore": session['totalScore'], "attempt": attempt, "word_answer": session['word_answer']})

    # Check word attempt against dictionary. If misspelled, return misspell status
    elif word not in dictionary[word_length]:
        return jsonify({"status": "misspell"})

    # If not misspelled, run check against answer and update tile status accordingly
    else:
        for i in range(word_length):
            if attempt[i]['letter'] == answer[i]:
                attempt[i]['green'] = True
                answer_check[i]['green'] = True
                continue
        # Second loop for yellow matches
        for i in range(word_length):
            if not attempt[i]['green']:  # Only if green: False
                for j in range(word_length):
                    # Check if the letter is present in answer and hasn't been marked in attempt
                    if attempt[i]['letter'] == answer[j] and not answer_check[j]['green'] and not answer_check[j]['yellow']:
                        attempt[i]['yellow'] = True
                        answer_check[j]['yellow'] = True
                        break

    if tries == 1:
        if txb_bool:
            return jsonify({"status": "update", "totalScore": session['totalScore'], "attempt": attempt, "word_details": session['word_details']})
        else:
            return jsonify({"status": "update", "totalScore": session['totalScore'], "attempt": attempt, "word_answer": session['word_answer']})
    else:
        return jsonify({"status": "update", "attempt": attempt})


if __name__ == '__main__':
    app.run(debug=True)
