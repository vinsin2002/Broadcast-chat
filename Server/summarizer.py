from flask import Flask, request, jsonify
from transformers import AutoTokenizer, pipeline

app = Flask(__name__)

tokenizer = AutoTokenizer.from_pretrained("summarizer-broadcast-tokenizer")
summarizer = pipeline("summarization", model="summarizer-broadcast-model", tokenizer=tokenizer)

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.json
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    gen_kwargs = {"length_penalty": 0.8, "num_beams": 8, "max_length": 128}
    summary = summarizer(text, **gen_kwargs)[0]["summary_text"]
    return jsonify({"summary": summary})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)