from flask import Flask, jsonify, request
import threading
from training import train 
from ranking import search_best_matches

app = Flask(__name__)

@app.route('/train', methods=['POST'])
def trigger_training():
    thread = threading.Thread(target=train)
    thread.start()
    print("Training process started in a separate thread.")
    return jsonify({"success": True, "message": "Training started"}), 202

@app.route('/rank', methods=['POST'])
def trigger_ranking():
    data = request.get_json() or {}
    form_id = data.get('form_id', 1)
    k = data.get('k', 20)
    
    try:
        results = search_best_matches(k=k, form_id=form_id)
        return jsonify({
            "success": True, 
            "form_id": form_id,
            "matches": results
        }), 200
        
    except ValueError as e:
        return jsonify({
            "success": False, 
            "message": str(e)
        }), 404
    except Exception as e:
        print(f"An error occurred while ranking for form_id {form_id} with k={k}: {e}")
        return jsonify({
            "success": False, 
            "message": "An error occurred while ranking.",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    print("Model API server is running on http://0.0.0.0:5000")