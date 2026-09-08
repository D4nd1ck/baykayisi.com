/* =================================
   KAYISI HUB - PROFİL / BAKİYE
================================= */


/* =================================
   BAKİYE MODALI
================================= */

function openDepositModal() {

    const modal =
        document.getElementById("depositModal");

    if (!modal) return;

    modal.classList.add("active");

    const message =
        document.getElementById("depositMessage");

    if (message) {
        message.textContent = "";
    }
}


/* =================================
   MODALI KAPAT
================================= */

function closeDepositModal() {

    const modal =
        document.getElementById("depositModal");

    if (!modal) return;

    modal.classList.remove("active");
}


/* =================================
   HAZIR TUTAR SEÇ
================================= */

function selectDepositAmount(amount) {

    const input =
        document.getElementById("depositAmount");

    if (!input) return;

    input.value = amount;
}


/* =================================
   BAKİYE YÜKLEME TALEBİ
================================= */

async function createDepositRequest() {

    /*
       Kullanıcı giriş yapmış mı?
    */

    if (!currentUser) {

        alert(
            "Önce giriş yapmalısın."
        );

        return;
    }


    const input =
        document.getElementById(
            "depositAmount"
        );


    const message =
        document.getElementById(
            "depositMessage"
        );


    if (!input || !message) {
        return;
    }


    const amount =
        Number(input.value);


    /*
       Tutar kontrolü
    */

    if (!Number.isFinite(amount)) {

        message.textContent =
            "❌ Geçerli bir tutar gir.";

        return;
    }


    /*
       Minimum 10 TL
    */

    if (amount < 10) {

        message.textContent =
            "❌ Minimum bakiye yükleme tutarı 10 TL.";

        return;
    }


    /*
       Maksimum 100.000 TL
    */

    if (amount > 100000) {

        message.textContent =
            "❌ Tek işlemde maksimum 100.000 TL yüklenebilir.";

        return;
    }


    /*
       Ondalık kontrolü
    */

    if (
        Math.round(amount * 100) !==
        amount * 100
    ) {

        message.textContent =
            "❌ Tutar en fazla 2 ondalık basamak içerebilir.";

        return;
    }


    /*
       Kullanıcıya bilgi
    */

    message.textContent =
        "⏳ Bakiye yükleme talebin oluşturuluyor...";


    /*
       Supabase'e talep gönder
    */

    const {
        data,
        error
    } = await supabaseClient
        .from("wallet_deposits")
        .insert({

            user_id:
                currentUser.id,

            amount:
                amount,

            status:
                "pending"

        })
        .select()
        .single();


    /*
       Hata kontrolü
    */

    if (error) {

        console.error(
            "Bakiye yükleme hatası:",
            error
        );


        message.textContent =
            "❌ Talep oluşturulamadı: " +
            error.message;

        return;
    }


    /*
       Başarılı
    */

    console.log(
        "Bakiye yükleme talebi:",
        data
    );


    message.textContent =
        "✅ Bakiye yükleme talebin oluşturuldu.";


    input.value = "";


    /*
       Biraz bekleyip modalı kapat
    */

    setTimeout(() => {

        closeDepositModal();

    }, 2500);
}


/* =================================
   MODAL DIŞINA TIKLAYINCA KAPAT
================================= */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "depositModal"
            );


        if (!modal) return;


        if (
            event.target === modal
        ) {

            closeDepositModal();

        }

    }
);


/* =================================
   ESC İLE KAPAT
================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key !== "Escape") {
            return;
        }


        closeDepositModal();

    }
);
