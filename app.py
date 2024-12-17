import os
import gradio as gr
from transformers import pipeline

# Load the pre-trained model for question answering
try:
    qa_pipeline = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")
except Exception as e:
    raise RuntimeError("Failed to load the QA pipeline. Ensure Transformers library is installed and the model is accessible.") from e

# Define the question-answering function
def answer_question(question, context):
    try:
        if not question or not context:
            return "Please provide both a question and a context."
        result = qa_pipeline({
            'question': question,
            'context': context
        })
        return result['answer']
    except Exception as e:
        return f"An error occurred: {str(e)}"

# Create the Gradio interface
iface = gr.Interface(
    fn=answer_question,
    inputs=[gr.Textbox(label="Question"), gr.Textbox(label="Context", lines=5)],
    outputs="text",
    title="Question Answering App",
    description="Ask a question based on the provided context."
)

# Launch the Gradio app with the correct port for Render
port = int(os.environ.get("PORT", 10000))  # Use Render's PORT or default to 10000
print(f"Server running on port {port}")  # Log the port number to help with debugging
iface.launch(
    server_name="0.0.0.0",  # Listen on all network interfaces
    server_port=port        # Use the dynamic port assigned by Render
)
