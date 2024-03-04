import os

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request
from tempfile import mkdtemp

# Configure application
app = Flask(__name__)

# DELETE THIS AFTER DEVELOPMENT
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True


# Configure CS50 Library to use SQLite database
nhwords = SQL("sqlite:///nhwords.db")
dbdict = SQL("sqlite:///dictionary.db")


@app.route("/", methods=["GET", "POST"])
def play():
    return render_template("play.html")


@app.route("/get_units_lessons", methods=["POST"])
def get_units_lessons():
    # Fetch the data from the request's JSON body
    textbooks = request.json.get("textbook_levels", [])

    # Query to fetch distinct units, lessons, and word lengths (lengths) for the selected textbooks
    base_query = "SELECT DISTINCT grade, unit, lesson, length FROM nhwords WHERE grade IN ({})".format(",".join("?" * len(textbooks)))
    data = nhwords.execute(base_query, *textbooks)

    # Organize data hierarchically
    organized_data = {}
    for row in data:
        grade = row["grade"]
        unit = row["unit"]
        lesson = row["lesson"]

        if grade not in organized_data:
            organized_data[grade] = {}

        if unit not in organized_data[grade]:
            organized_data[grade][unit] = []

        if lesson not in organized_data[grade][unit]:
            organized_data[grade][unit].append(lesson)

    return jsonify(organized_data)

if __name__ == "__main__":
    app.run(debug=True)