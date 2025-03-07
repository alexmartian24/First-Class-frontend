import json
import os
from flask import Flask, request, jsonify

app = Flask(__name__)
DATA_FILE = "people_data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as file:
            return json.load(file)
    return []

def save_data(data):
    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=4)

@app.route("/add_person", methods=["POST"])
def add_person():
    data = request.json
    people = load_data()
    
    new_person = {
        "name": data.get("name"),
        "email": data.get("email"),
        "affiliation": data.get("affiliation"),
        "role": data.get("role")
    }
    
    people.append(new_person)
    save_data(people)
    return jsonify({"message": "Person added successfully", "data": new_person}), 201

@app.route("/export_people", methods=["GET"])
def export_people():
    people = load_data()
    return jsonify(people), 200

if __name__ == "__main__":
    app.run(debug=True)
