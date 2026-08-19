// Load chat history on page load
async function loadHistory() {
    const chatBox = document.getElementById("chat-box");
    try {
        const response = await fetch("http://192.168.49.2:30007/history");
        const data = await response.json();

        data.history.forEach(chat => {
            chatBox.innerHTML += `<div class="message user">${escapeHtml(chat.query)}</div>`;
            chatBox.innerHTML += `<div class="message bot">${escapeHtml(chat.response)}</div>`;
        });

        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: "smooth"
        });
    } catch (error) {
        console.error("Failed to load history:", error);
    }
}

// Send message function
async function sendMessage() {
    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    const userText = input.value.trim();
    if (!userText) return;

    // User message
    chatBox.innerHTML += `<div class="message user">${escapeHtml(userText)}</div>`;

    // Typing animation
    const loadingId = "loading-" + Date.now();
    chatBox.innerHTML += `
        <div class="message bot" id="${loadingId}">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>`;

    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth"
    });

    input.value = "";
    input.disabled = true;

    try {
        const response = await fetch(
            `http://192.168.49.2:30007/chat?query=${encodeURIComponent(userText)}`
        );
        const data = await response.json();

        // Remove loading animation
        document.getElementById(loadingId).remove();

        // Show bot response
        chatBox.innerHTML += `<div class="message bot">${escapeHtml(data.response)}</div>`;

    } catch (error) {
        document.getElementById(loadingId).remove();
        chatBox.innerHTML += `<div class="message bot">Error connecting to backend</div>`;
    }

    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth"
    });

    input.disabled = false;
    input.focus();
}

// Clear chat function
async function clearChat() {
    try {
        await fetch("http://192.168.49.2:30007/history", {
            method: "DELETE"
        });
        document.getElementById("chat-box").innerHTML = "";
    } catch (error) {
        alert("Failed to clear chat");
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

