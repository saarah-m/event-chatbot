// chat-widget.js
const sessionId = Math.random().toString(36).slice(2); // unique per browser session

async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value;
    input.value = "";

    appendMessage("You", message);

    const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId })
    });

    const data = await response.json();
    appendMessage("Assistant", data.reply);
}

function appendMessage(sender, text) {
    const chat = document.getElementById("chat-box");
    chat.innerHTML += `<p><strong>${sender}:</strong> ${text}</p>`;
    chat.scrollTop = chat.scrollHeight;
}