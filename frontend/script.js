/* =========================================================
   AI DEVOPS ASSISTANT
   Frontend Controller
   ========================================================= */


const API_BASE_URL = "http://192.168.49.2:30007";


/* =========================================================
   STATE
   ========================================================= */

let historyData = [];

let activeHistoryIndex = null;


/* =========================================================
   DOM
   ========================================================= */

const chatBox = document.getElementById("chat-box");

const input = document.getElementById("user-input");

const welcomeScreen =
    document.getElementById("welcome-screen");

const historyList =
    document.getElementById("history-list");

const searchInput =
    document.getElementById("history-search");

const sendButton =
    document.getElementById("send-btn");


/* =========================================================
   LOAD HISTORY
   ========================================================= */

async function loadHistory() {

    try {

        const response =
            await fetch(`${API_BASE_URL}/history`);

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        historyData =
            data.history || [];

        renderHistory(historyData);

    } catch (error) {

        console.error(
            "Failed to load history:",
            error
        );

        renderHistory([]);

    }

}


/* =========================================================
   RENDER HISTORY SIDEBAR
   ========================================================= */

function renderHistory(items) {

    historyList.innerHTML = "";

    if (!items.length) {

        historyList.innerHTML = `
            <div class="empty-history">
                <div>💬</div>
                <span>No conversations yet</span>
            </div>
        `;

        return;

    }


    items.forEach((chat, index) => {

        const item =
            document.createElement("div");

        item.className =
            "history-item";


        if (index === activeHistoryIndex) {

            item.classList.add("active");

        }


        const title =
            createConversationTitle(
                chat.query
            );


        const preview =
            truncateText(
                chat.response,
                45
            );


        item.innerHTML = `

            <div class="history-icon">
                ${getHistoryIcon(chat.query)}
            </div>

            <div class="history-content">

                <div class="history-title">
                    ${escapeHtml(title)}
                </div>

                <div class="history-preview">
                    ${escapeHtml(preview)}
                </div>

            </div>

        `;


        item.addEventListener(
            "click",
            () => {

                openHistory(index);

            }
        );


        historyList.appendChild(item);

    });

}


/* =========================================================
   OPEN HISTORY
   ========================================================= */

function openHistory(index) {

    const chat =
        historyData[index];

    if (!chat) {

        return;

    }


    activeHistoryIndex =
        index;


    welcomeScreen.classList.add(
        "hidden"
    );


    chatBox.innerHTML = "";


    addUserMessage(
        chat.query
    );


    addBotMessage(
        chat.response
    );


    renderHistory(
        historyData
    );


    scrollToBottom();

}


/* =========================================================
   SEARCH HISTORY
   ========================================================= */

function searchHistory() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!searchTerm) {

        renderHistory(historyData);

        return;

    }


    const filtered =
        historyData.filter(chat => {

            return (

                String(chat.query)
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                String(chat.response)
                    .toLowerCase()
                    .includes(searchTerm)

            );

        });


    renderHistory(filtered);

}


/* =========================================================
   NEW CHAT
   ========================================================= */

function newChat() {

    activeHistoryIndex = null;

    chatBox.innerHTML = "";

    welcomeScreen.classList.remove(
        "hidden"
    );

    input.value = "";

    input.focus();

    renderHistory(historyData);

}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    const userText =
        input.value.trim();


    if (!userText) {

        return;

    }


    welcomeScreen.classList.add(
        "hidden"
    );


    activeHistoryIndex = null;


    addUserMessage(
        userText
    );


    const loadingId =
        "loading-" + Date.now();


    addTypingMessage(
        loadingId
    );


    scrollToBottom();


    input.value = "";

    autoResizeTextarea();


    input.disabled = true;

    sendButton.disabled = true;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        query: userText
                    })
                }
            );


        const data =
            await response.json();


        removeMessage(
            loadingId
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                `HTTP ${response.status}`
            );

        }


        addBotMessage(
            data.response
        );


        scrollToBottom();


        // Refresh history so the
        // sidebar contains the new chat.

        await loadHistory();


    } catch (error) {

        console.error(
            "Chat request failed:",
            error
        );


        removeMessage(
            loadingId
        );


        addBotMessage(
            `Error connecting to backend: ${error.message}`
        );

    }


    input.disabled = false;

    sendButton.disabled = false;

    input.focus();

}


/* =========================================================
   ADD USER MESSAGE
   ========================================================= */

function addUserMessage(text) {

    const row =
        document.createElement("div");

    row.className =
        "message-row user";


    const message =
        document.createElement("div");

    message.className =
        "message";


    message.textContent =
        text;


    row.appendChild(
        message
    );


    chatBox.appendChild(
        row
    );

}


/* =========================================================
   ADD BOT MESSAGE
   ========================================================= */

function addBotMessage(text) {

    const row =
        document.createElement("div");

    row.className =
        "message-row bot";


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        "🤖";


    const message =
        document.createElement("div");

    message.className =
        "message";


    message.textContent =
        text;


    row.appendChild(
        avatar
    );

    row.appendChild(
        message
    );


    chatBox.appendChild(
        row
    );

}


/* =========================================================
   TYPING INDICATOR
   ========================================================= */

function addTypingMessage(id) {

    const row =
        document.createElement("div");

    row.className =
        "message-row bot";

    row.id = id;


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        "🤖";


    const message =
        document.createElement("div");

    message.className =
        "message";


    message.innerHTML = `

        <div class="typing">

            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>

        </div>

    `;


    row.appendChild(
        avatar
    );

    row.appendChild(
        message
    );


    chatBox.appendChild(
        row
    );

}


/* =========================================================
   REMOVE MESSAGE
   ========================================================= */

function removeMessage(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.remove();

    }

}


/* =========================================================
   CLEAR CHAT
   ========================================================= */

async function clearChat() {

    const confirmed =
        confirm(
            "Clear all conversation history?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/clear`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                `HTTP ${response.status}`
            );

        }


        historyData = [];

        activeHistoryIndex = null;


        chatBox.innerHTML = "";

        welcomeScreen.classList.remove(
            "hidden"
        );


        renderHistory([]);


    } catch (error) {

        console.error(
            "Failed to clear history:",
            error
        );


        alert(
            "Failed to clear history: " +
            error.message
        );

    }

}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function useSuggestion(text) {

    input.value =
        text;


    autoResizeTextarea();

    input.focus();

}


/* =========================================================
   HISTORY TITLE
   ========================================================= */

function createConversationTitle(query) {

    const text =
        String(query || "")
            .trim();


    if (!text) {

        return "New conversation";

    }


    if (text.length <= 32) {

        return text;

    }


    return text.substring(0, 32) + "...";

}


/* =========================================================
   HISTORY ICON
   ========================================================= */

function getHistoryIcon(query) {

    const text =
        String(query || "")
            .toLowerCase();


    if (
        text.includes("kubernetes") ||
        text.includes("kubectl") ||
        text.includes("pod")
    ) {

        return "☸️";

    }


    if (
        text.includes("docker") ||
        text.includes("container")
    ) {

        return "🐳";

    }


    if (
        text.includes("redis")
    ) {

        return "🔴";

    }


    if (
        text.includes("postgres") ||
        text.includes("database")
    ) {

        return "🐘";

    }


    if (
        text.includes("trivy") ||
        text.includes("security")
    ) {

        return "🛡️";

    }


    if (
        text.includes("prometheus") ||
        text.includes("grafana")
    ) {

        return "📊";

    }


    return "💬";

}


/* =========================================================
   TRUNCATE
   ========================================================= */

function truncateText(text, length) {

    const value =
        String(text || "");


    if (value.length <= length) {

        return value;

    }


    return (
        value.substring(0, length) +
        "..."
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        String(text ?? "");


    return div.innerHTML;

}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

    chatBox.scrollTo({

        top:
            chatBox.scrollHeight,

        behavior:
            "smooth"

    });

}


/* =========================================================
   TEXTAREA AUTO RESIZE
   ========================================================= */

function autoResizeTextarea() {

    input.style.height =
        "auto";


    input.style.height =
        Math.min(
            input.scrollHeight,
            130
        ) + "px";

}


/* =========================================================
   ENTER KEY
   ========================================================= */

input.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================================================
   TEXTAREA INPUT
   ========================================================= */

input.addEventListener(
    "input",
    autoResizeTextarea
);


/* =========================================================
   SIDEBAR TOGGLE
   ========================================================= */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    sidebar.classList.toggle(
        "mobile-open"
    );

}


/* =========================================================
   INITIAL LOAD
   ========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadHistory();

        input.focus();

    }
);
