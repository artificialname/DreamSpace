import os
import gradio as gr
from transformers import pipeline

# Load the pre-trained model for question answering
qa_pipeline = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

# Define the question-answering function
def answer_question(question, context):
    result = qa_pipeline({
        'question': question,
        'context': context
    })
    return result['answer']

# Create the Gradio interface
iface = gr.Interface(
    fn=answer_question,
    inputs=[gr.Textbox(label="Question"), gr.Textbox(label="Context", lines=5)],
    outputs="text",
    title="Question Answering App",
    description="Ask a question based on the provided context."
)

# Use Render's PORT environment variable
iface.launch(server_port=int(os.environ.get("PORT", 7860)), server_name="0.0.0.0")
