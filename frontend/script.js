const API_BASE_URL = "http://192.168.49.2:30007";

// Load chat history
async function loadHistory() {
    const chatBox = document.getElementById("chat-box");

    try {
        const response = await fetch(`${API_BASE_URL}/history`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        chatBox.innerHTML = "";

        data.history.forEach(chat => {
            chatBox.innerHTML +=
                `<div class="message user">${escapeHtml(chat.query)}</div>`;

            chatBox.innerHTML +=
                `<div class="message bot">${escapeHtml(chat.response)}</div>`;
        });

        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: "smooth"
        });

    } catch (error) {
        console.error("Failed to load history:", error);
    }
}


// Send message
async function sendMessage() {
    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    const userText = input.value.trim();

    if (!userText) {
        return;
    }

    // Show user message
    chatBox.innerHTML +=
        `<div class="message user">${escapeHtml(userText)}</div>`;

    // Loading animation
    const loadingId = "loading-" + Date.now();

    chatBox.innerHTML += `
        <div class="message bot" id="${loadingId}">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>
    `;

    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth"
    });

    input.value = "";
    input.disabled = true;

    try {

        // Current backend expects POST /chat
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: userText
            })
        });

        const data = await response.json();

        // Remove loading animation
        const loadingElement = document.getElementById(loadingId);

        if (loadingElement) {
            loadingElement.remove();
        }

        if (!response.ok) {
            throw new Error(data.detail || `HTTP ${response.status}`);
        }

        // Display AI response
        chatBox.innerHTML +=
            `<div class="message bot">${escapeHtml(data.response)}</div>`;

    } catch (error) {

        console.error("Chat request failed:", error);

        const loadingElement = document.getElementById(loadingId);

        if (loadingElement) {
            loadingElement.remove();
        }

        chatBox.innerHTML +=
            `<div class="message bot">Error connecting to backend: ${escapeHtml(error.message)}</div>`;
    }

    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth"
    });

    input.disabled = false;
    input.focus();
}


// Clear chat
async function clearChat() {

    try {

        const response = await fetch(`${API_BASE_URL}/clear`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || `HTTP ${response.status}`);
        }

        document.getElementById("chat-box").innerHTML = "";

    } catch (error) {

        console.error("Failed to clear chat:", error);

        alert("Failed to clear chat: " + error.message);
    }
}


// Escape HTML to prevent XSS
function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// Enter key support
document.getElementById("user-input")
    .addEventListener("keypress", function (e) {

        if (e.key === "Enter") {
            sendMessage();
        }

    });


// Load history when page loads
window.addEventListener("DOMContentLoaded", loadHistory);
