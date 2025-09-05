const input = document.querySelector("#input");
const chatContainer = document.querySelector("#chat-container");
const askBtn = document.querySelector("#ask");

const threadId =
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

input?.addEventListener("keydown", handleEnter);
askBtn?.addEventListener("click", handleAsk);

// Auto-resize textarea
input.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
});

// Create floating particles
function createParticle() {
    const particle = document.createElement("div");
    particle.className = "floating-particle";
    particle.style.left = Math.random() * 100 + "vw";
    document.getElementById("particles").appendChild(particle);

    setTimeout(() => particle.remove(), 8000);
}

setInterval(createParticle, 2000);

// Enhanced loading
const loading = document.createElement("div");
loading.className = "my-6 glass p-4 rounded-xl max-w-fit";
loading.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-r from-[#00D68F] to-[#6B46C1] rounded-full flex items-center justify-center">🤖</div>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="text-gray-400">Thinking...</span>
            </div>
        `;

async function generate(text) {
    // User message
    const msg = document.createElement("div");
    msg.className = `my-6 message-user p-4 rounded-xl ml-auto max-w-3xl`;
    msg.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="flex-1">
                        <div class="text-sm opacity-70 mb-1">You</div>
                        <div>${text}</div>
                    </div>
                    <div class="w-8 h-8 bg-gradient-to-r from-[#00D68F] to-[#6B46C1] rounded-full flex items-center justify-center text-sm">
                        👤
                    </div>
                </div>
            `;

    chatContainer?.appendChild(msg);
    input.value = "";
    input.style.height = "auto";

    chatContainer?.appendChild(loading);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const assistantMessage = await callServer(text);

        const assistantMsgElem = document.createElement("div");
        assistantMsgElem.className = `my-6 message-ai p-4 rounded-xl max-w-3xl`;
        assistantMsgElem.innerHTML = `
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-r from-[#6B46C1] to-[#00D68F] rounded-full flex items-center justify-center text-sm">🤖</div>
                        <div class="flex-1">
                            <div class="text-sm opacity-70 mb-1">ByteShaala Chat</div>
                            <div>${assistantMessage}</div>
                        </div>
                    </div>
                `;

        loading.remove();
        chatContainer?.appendChild(assistantMsgElem);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (error) {
        loading.remove();
        const errorMsg = document.createElement("div");
        errorMsg.className = `my-6 glass p-4 rounded-xl max-w-fit border border-red-500`;
        errorMsg.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <div class="text-red-400 text-xl">⚠️</div>
                        <div class="text-red-300">Something went wrong. Please try again.</div>
                    </div>
                `;
        chatContainer?.appendChild(errorMsg);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

async function callServer(inputText) {
    const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ threadId: threadId, message: inputText }),
    });

    if (!response.ok) {
        throw new Error("Error generating the response.");
    }

    const result = await response.json();
    return result.message;
}

async function handleAsk(e) {
    const text = input?.value.trim();
    if (!text) return;
    await generate(text);
}

async function handleEnter(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const text = input?.value.trim();
        if (!text) return;
        await generate(text);
    }
}

// Focus input on load
window.addEventListener("load", () => {
    input.focus();
});
