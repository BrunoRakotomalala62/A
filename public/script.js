function getUID() {
    let uid = localStorage.getItem("uid");

    // Si aucun UID n'existe, on en génère un nouveau
    if (!uid) {
        uid = Math.random().toString(36).substr(2, 9); // Générer un UID unique
        localStorage.setItem("uid", uid); // Stocker l'UID dans localStorage
    }

    return uid;
}

// Gestion du menu hamburger
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');

    // Gestion du clic sur le hamburger
    hamburgerMenu.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = sidebar.contains(event.target);
        const isClickOnHamburger = hamburgerMenu.contains(event.target);

        if (!isClickInsideMenu && !isClickOnHamburger && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // Gestion des dropdowns
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('span');

        dropdownToggle.addEventListener('click', function() {
            dropdown.classList.toggle('active');
        });
    });
});

// Event Listener pour le bouton 1
if(document.querySelector('#getButton1')) {
document.getElementById("getButton1").addEventListener("click", () => {
    const uid = getUID(); // Récupérer ou générer un UID
    window.location.href = `/date?heure=Madagascar`;
});
}

if(document.querySelector('#getButton2')) {
document.getElementById("getButton2").addEventListener("click", () => {
    window.location.href = "/francais"; // Redirection vers la deuxième route
});
}

// Event Listener pour le bouton 3
if(document.querySelector('#getButton3')) {
document.getElementById("getButton3").addEventListener("click", () => {
    const uid = getUID();
    window.location.href = `/llama?question=Bonjour&uid=${encodeURIComponent(uid)}`;
});
}

// Event Listener pour le bouton 4
if(document.querySelector('#getButton4')) {
document.getElementById("getButton4").addEventListener("click", () => {
    const uid = getUID();
    window.location.href = `/deepseek?question=Bonjour&uid=${encodeURIComponent(uid)}`;
});
}

// Event Listener pour le bouton 5
if(document.querySelector('#getButton5')) {
document.getElementById("getButton5").addEventListener("click", () => {
    const uid = getUID();
    window.location.href = `/deepseek?question=Bonjour&uid=${encodeURIComponent(uid)}`;
});
}

// Event Listener pour le bouton 6
if(document.querySelector('#getButton6')) {
document.getElementById("getButton6").addEventListener("click", () => {
    const uid = getUID();
    window.location.href = `/llama11?question=Bonjour&uid=${encodeURIComponent(uid)}`;
});
}

if(document.querySelector('#getButton7')) {
document.getElementById("getButton7").addEventListener("click", () => {
    const uid = getUID();
    window.location.href = `/qwen-coder?q=Bonjour&uid=${encodeURIComponent(uid)}`;
});
}

if(document.querySelector('#getButton8')) {
document.getElementById("getButton8").addEventListener("click", () => {
    const uid = getUID();
    let prompt = "Qui es-tu ?"; // Question par défaut

    const imageUrl = document.getElementById("imageUrlInput").value; // Récupère l'URL de l'image entrée

    // Si une URL d'image est fournie, on change la question
    if (imageUrl) {
        prompt = "Décrivez cette photo";
        // On redirige vers l'URL avec l'image
        window.location.href = `/gemini?prompt=${encodeURIComponent(prompt)}&uid=${encodeURIComponent(uid)}&image=${encodeURIComponent(imageUrl)}`;
    } else {
        // Si aucune image n'est fournie, on envoie uniquement la question par défaut
        window.location.href = `/gemini?prompt=${encodeURIComponent(prompt)}&uid=${encodeURIComponent(uid)}`;
    }
});
}

if(document.querySelector('#getButton9')) {
document.getElementById("getButton9").addEventListener("click", () => {
    window.location.href = `/conjugaison?verbe=devoir`;
});
}

if(document.querySelector('#getButton10')) {
document.getElementById("getButton10").addEventListener("click", () => {
    window.location.href = `/quiz`;
});
}

if(document.querySelector('#getButton11')) {
document.getElementById("getButton11").addEventListener("click", () => {
    window.location.href = `/translation?text=Bonjour%20le%20monde&langue=en`;
});
}

if(document.querySelector('#getButton12')) {
document.getElementById("getButton12").addEventListener("click", () => {
    window.location.href = "/hira?ffpm=Andriamanitra"; // Redirection vers la deuxième route
});
}


if(document.querySelector('#getButton13')) {
document.getElementById("getButton13").addEventListener("click", () => {
    window.location.href = "/baiboly?boky=rehetra"; // Redirection vers la première route
});
}

if(document.querySelector('#getButton14')) {
document.getElementById("getButton14").addEventListener("click", () => {
    window.location.href = "/tadiavina?boky=Jenezy"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton15')) {
document.getElementById("getButton15").addEventListener("click", () => {
    window.location.href = "/recherche?synonym=allongement"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton16')) {
document.getElementById("getButton16").addEventListener("click", () => {
    window.location.href = "/search?antonym=allongement"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton17')) {
document.getElementById("getButton17").addEventListener("click", () => {
    window.location.href = "/api?photo=Lémurien"; // Redirection vers la deuxième route
});
}

// Event Listener pour le bouton 1
if(document.querySelector('#getButton18')) {
document.getElementById("getButton18").addEventListener("click", () => {
    const uid = getUID(); // Récupérer ou générer un UID
    window.location.href = `/gem29?question=Bonjour&uid=${encodeURIComponent(uid)}`;
});
}

if(document.querySelector('#getButton19')) {
document.getElementById("getButton19").addEventListener("click", () => {
    window.location.href = "/mpanakanto?anarana=Princio"; // Redirection vers la première route
});
}

if(document.querySelector('#getButton20')) {
document.getElementById("getButton20").addEventListener("click", () => {
    window.location.href = "/parole?mpihira=Princio&titre=Allo%20jesosy"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton21')) {
document.getElementById("getButton21").addEventListener("click", () => {
    window.location.href = "/create"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton30')) {
document.getElementById("getButton30").addEventListener("click", () => {
    const uid = getUID();
    window.location.href = `/meta-llama-4?query=Bonjour&uid=${encodeURIComponent(uid)}`;
});
}


if(document.querySelector('#getButton22')) {
document.getElementById("getButton22").addEventListener("click", () => {
    window.location.href = "inbox?message="; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton23')) {
document.getElementById("getButton23").addEventListener("click", () => {
    window.location.href = "/llama?question=bonjour&uid=123"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton24')) {
document.getElementById("getButton24").addEventListener("click", () => {
    window.location.href = "/wiki?recherche=Kolontsaina"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton25')) {
document.getElementById("getButton25").addEventListener("click", () => {
    window.location.href = "/fitadiavana?ohabolana=omby&page=1"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton26')) {
document.getElementById("getButton26").addEventListener("click", () => {
    window.location.href = "/audio?tononkalo=audio&page=1"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton27')) {
document.getElementById("getButton27").addEventListener("click", () => {
    window.location.href = "/signe/rechercher?horoscope=belier"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton28')) {
document.getElementById("getButton28").addEventListener("click", () => {
    window.location.href = "/apigemini?prompt=bonjour&uid=123"; // Redirection vers la deuxième route
});
}

if(document.querySelector('#getButton29')) {
document.getElementById("getButton29").addEventListener("click", () => {
    window.location.href = "/devises/liste"; // Redirection vers la deuxième route
});
}