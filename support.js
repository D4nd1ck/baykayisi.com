/* =========================================================
   BAYKAYISI - CANLI DESTEK
   GitHub Pages + Supabase
========================================================= */

(function () {

    const SUPPORT_STYLE = `
    #bkSupportButton {
        position: fixed;
        right: 22px;
        bottom: 22px;
        width: 62px;
        height: 62px;
        border: 0;
        border-radius: 50%;
        background: #111827;
        color: white;
        font-size: 27px;
        cursor: pointer;
        z-index: 99999;
        box-shadow: 0 8px 30px rgba(0,0,0,.25);
    }

    #bkSupportButton:hover {
        transform: scale(1.05);
    }

    #bkSupportBox {
        position: fixed;
        right: 22px;
        bottom: 95px;
        width: 360px;
        max-width: calc(100vw - 30px);
        height: 520px;
        background: white;
        border-radius: 18px;
        box-shadow: 0 15px 50px rgba(0,0,0,.25);
        overflow: hidden;
        z-index: 99998;
        display: none;
        flex-direction: column;
        font-family: Arial, sans-serif;
    }

    #bkSupportHeader {
        background: #111827;
        color: white;
        padding: 17px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    #bkSupportHeader strong {
        font-size: 16px;
    }

    #bkSupportStatus {
        font-size: 12px;
        opacity: .75;
        margin-top: 3px;
    }

    #bkSupportClose {
        border: 0;
        background: transparent;
        color: white;
        font-size: 22px;
        cursor: pointer;
    }

    #bkSupportMessages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        background: #f3f4f6;
    }

    .bkMsg {
        max-width: 82%;
        padding: 10px 13px;
        margin-bottom: 10px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.4;
        word-break: break-word;
    }

    .bkMsg.user {
        margin-left: auto;
        background: #111827;
        color: white;
        border-bottom-right-radius: 4px;
    }

    .bkMsg.admin {
        margin-right: auto;
        background: white;
        color: #111827;
        border-bottom-left-radius: 4px;
    }

    .bkMsg.ai {
        margin-right: auto;
        background: #e5e7eb;
        color: #111827;
        border-bottom-left-radius: 4px;
    }

    .bkMsg small {
        display: block;
        margin-top: 4px;
        opacity: .55;
        font-size: 10px;
    }

    #bkSupportActions {
        padding: 8px 12px;
        border-top: 1px solid #ddd;
        background: white;
        display: flex;
        gap: 7px;
    }

    .bkAction {
        border: 1px solid #ddd;
        background: white;
        border-radius: 9px;
        padding: 7px 10px;
        cursor: pointer;
        font-size: 12px;
    }

    .bkAction:hover {
        background: #f3f4f6;
    }

    #bkSupportInputArea {
        display: flex;
        gap: 8px;
        padding: 12px;
        border-top: 1px solid #ddd;
        background: white;
    }

    #bkSupportInput {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 11px;
        outline: none;
        resize: none;
        font-family: inherit;
    }

    #bkSupportSend {
        width: 45px;
        border: 0;
        border-radius: 12px;
        background: #111827;
        color: white;
        cursor: pointer;
    }

    #bkSupportLogin {
        padding: 30px;
        text-align: center;
        color: #555;
    }

    @media(max-width:600px) {
        #bkSupportBox {
            right: 10px;
            bottom: 82px;
            width: calc(100vw - 20px);
            height: 70vh;
        }

        #bkSupportButton {
            right: 15px;
            bottom: 15px;
        }
    }
    `;

    const style = document.createElement("style");
    style.textContent = SUPPORT_STYLE;
    document.head.appendChild(style);

    const button = document.createElement("button");
    button.id = "bkSupportButton";
    button.innerHTML = "💬";
    button.title = "Canlı Destek";

    const box = document.createElement("div");
    box.id = "bkSupportBox";

    box.innerHTML = `
        <div id="bkSupportHeader">
            <div>
                <strong>Baykayısı Destek</strong>
                <div id="bkSupportStatus">
                    🤖 AI destek aktif
                </div>
            </div>

            <button id="bkSupportClose">×</button>
        </div>

        <div id="bkSupportMessages"></div>

        <div id="bkSupportActions">
            <button class="bkAction" id="bkAskAI">
                🤖 AI Destek
            </button>

            <button class="bkAction" id="bkAskAdmin">
                👨‍💻 Temsilci
            </button>
        </div>

        <div id="bkSupportInputArea">
            <textarea
                id="bkSupportInput"
                rows="1"
                placeholder="Mesajınızı yazın..."
            ></textarea>

            <button id="bkSupportSend">➤</button>
        </div>
    `;

    document.body.appendChild(button);
    document.body.appendChild(box);

    let currentUser = null;
    let currentRoom = null;
    let realtimeChannel = null;
    let supportMode = "ai";

    function escapeHTML(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function addMessage(type, message, time = new Date()) {

        const container =
            document.getElementById("bkSupportMessages");

        const item = document.createElement("div");

        item.className = "bkMsg " + type;

        item.innerHTML = `
            ${escapeHTML(message)}
            <small>
                ${time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })}
            </small>
        `;

        container.appendChild(item);

        container.scrollTop = container.scrollHeight;
    }

    async function init() {

        if (!window.supabaseClient) {

            console.warn(
                "support.js: window.supabaseClient bulunamadı."
            );

            return;
        }

        const {
            data,
            error
        } = await window.supabaseClient.auth.getUser();

        if (error || !data.user) {

            currentUser = null;

            document.getElementById(
                "bkSupportMessages"
            ).innerHTML = `
                <div id="bkSupportLogin">
                    <div style="font-size:35px">🔐</div>
                    <h3>Giriş yapmalısınız</h3>
                    <p>
                        Canlı destek kullanmak için
                        hesabınıza giriş yapın.
                    </p>
                </div>
            `;

            return;
        }

        currentUser = data.user;

        await getOrCreateRoom();

    }

    async function getOrCreateRoom() {

        const client = window.supabaseClient;

        let {
            data:rooms,
            error
        } = await client
            .from("support_rooms")
            .select("*")
            .eq("user_id", currentUser.id)
            .eq("status", "open")
            .order("created_at", {
                ascending: false
            })
            .limit(1);

        if (error) {
            console.error(error);
            return;
        }

        if (rooms && rooms.length) {

            currentRoom = rooms[0];

        } else {

            const result =
                await client
                    .from("support_rooms")
                    .insert({
                        user_id: currentUser.id
                    })
                    .select()
                    .single();

            if (result.error) {

                console.error(result.error);
                return;

            }

            currentRoom = result.data;
        }

        await loadMessages();
        subscribeMessages();

        addWelcomeMessage();
    }

    async function loadMessages() {

        const client = window.supabaseClient;

        const {
            data,
            error
        } = await client
            .from("support_messages")
            .select("*")
            .eq("room_id", currentRoom.id)
            .order("created_at", {
                ascending: true
            });

        if (error) {

            console.error(error);
            return;

        }

        const container =
            document.getElementById(
                "bkSupportMessages"
            );

        container.innerHTML = "";

        data.forEach(msg => {

            addMessage(
                msg.sender_type,
                msg.message,
                new Date(msg.created_at)
            );

        });
    }

    function subscribeMessages() {

        if (realtimeChannel) {

            window.supabaseClient
                .removeChannel(realtimeChannel);

        }

        realtimeChannel =
            window.supabaseClient
                .channel(
                    "support-" + currentRoom.id
                )
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "support_messages",
                        filter:
                            "room_id=eq." +
                            currentRoom.id
                    },
                    payload => {

                        const msg =
                            payload.new;

                        // Kendi gönderdiğimiz mesajı tekrar gösterme
                        if (
                            msg.sender_id ===
                            currentUser.id
                        ) {
                            return;
                        }

                        addMessage(
                            msg.sender_type,
                            msg.message,
                            new Date(msg.created_at)
                        );

                    }
                )
                .subscribe();
    }

    function addWelcomeMessage() {

        const messages =
            document.getElementById(
                "bkSupportMessages"
            );

        if (messages.children.length > 0)
            return;

        addMessage(
            "ai",
            "Merhaba 👋 Ben Baykayısı AI destek asistanıyım. Size nasıl yardımcı olabilirim?"
        );
    }

    async function sendDatabaseMessage(
        message,
        type = "user"
    ) {

        if (!currentRoom)
            return;

        const {
            error
        } = await window.supabaseClient
            .from("support_messages")
            .insert({
                room_id: currentRoom.id,
                sender_id: currentUser.id,
                sender_type: type,
                message: message
            });

        if (error) {

            console.error(
                "Mesaj gönderilemedi:",
                error
            );

            addMessage(
                "ai",
                "Mesaj gönderilirken bir hata oluştu."
            );

            return false;
        }

        return true;
    }

    async function sendMessage() {

        const input =
            document.getElementById(
                "bkSupportInput"
            );

        const message =
            input.value.trim();

        if (!message)
            return;

        if (!currentUser) {

            addMessage(
                "ai",
                "Destek kullanmak için önce giriş yapmalısınız."
            );

            return;
        }

        input.value = "";

        addMessage(
            "user",
            message
        );

        await sendDatabaseMessage(
            message,
            "user"
        );

        if (supportMode === "ai") {

            await askAI(message);

        }

    }

    async function askAI(message) {

        const status =
            document.getElementById(
                "bkSupportStatus"
            );

        status.textContent =
            "🤖 AI cevap yazıyor...";

        try {

            /*
              Supabase Edge Function:

              support-ai

              Bu fonksiyon OpenAI API'sine
              güvenli şekilde istek atacak.
            */

            const {
                data,
                error
            } = await window.supabaseClient.functions
                .invoke(
                    "support-ai",
                    {
                        body: {
                            message: message,
                            user_id: currentUser.id,
                            room_id: currentRoom.id
                        }
                    }
                );

            if (error)
                throw error;

            const answer =
                data?.answer ||
                "Bu konuda size yardımcı olamadım. Bir temsilciye bağlanabilirsiniz.";

            await window.supabaseClient
                .from("support_messages")
                .insert({
                    room_id: currentRoom.id,
                    sender_id: currentUser.id,
                    sender_type: "ai",
                    message: answer
                });

            addMessage(
                "ai",
                answer
            );

        } catch (error) {

            console.error(
                "AI Hatası:",
                error
            );

            addMessage(
                "ai",
                "AI şu anda kullanılamıyor. 👨‍💻 Temsilciye bağlanmak için yukarıdaki butona basabilirsiniz."
            );

        }

        status.textContent =
            supportMode === "admin"
                ? "👨‍💻 Temsilci modu"
                : "🤖 AI destek aktif";
    }

    button.addEventListener(
        "click",
        () => {

            const isOpen =
                box.style.display === "flex";

            box.style.display =
                isOpen ? "none" : "flex";

            if (!isOpen)
                init();

        }
    );

    document.getElementById(
        "bkSupportClose"
    ).addEventListener(
        "click",
        () => {

            box.style.display = "none";

        }
    );

    document.getElementById(
        "bkSupportSend"
    ).addEventListener(
        "click",
        sendMessage
    );

    document.getElementById(
        "bkSupportInput"
    ).addEventListener(
        "keydown",
        e => {

            if (
                e.key === "Enter" &&
                !e.shiftKey
            ) {

                e.preventDefault();

                sendMessage();

            }

        }
    );

    document.getElementById(
        "bkAskAI"
    ).addEventListener(
        "click",
        () => {

            supportMode = "ai";

            document.getElementById(
                "bkSupportStatus"
            ).textContent =
                "🤖 AI destek aktif";

        }
    );

    document.getElementById(
        "bkAskAdmin"
    ).addEventListener(
        "click",
        async () => {

            supportMode = "admin";

            document.getElementById(
                "bkSupportStatus"
            ).textContent =
                "👨‍💻 Temsilci modu";

            addMessage(
                "ai",
                "Tamamdır. Mesajınız canlı destek ekibimize iletildi. Bir temsilci size buradan cevap verecek. 👍"
            );

        }
    );

})();
