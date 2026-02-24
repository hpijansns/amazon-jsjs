import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfA-mFODccLz13nLpFQFI5Q2qBNIS2_KI",
  authDomain: "flipkart-clone-ab903.firebaseapp.com",
  databaseURL: "https://flipkart-clone-ab903-default-rtdb.firebaseio.com",
  projectId: "flipkart-clone-ab903",
  storageBucket: "flipkart-clone-ab903.firebasestorage.app",
  messagingSenderId: "733319152647",
  appId: "1:733319152647:web:cb5943fc21d8676bad16a2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- 10 Minutes Countdown Timer ---
function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        if (--timer < 0) { timer = duration; } // Reset after 10 mins
    }, 1000);
}

window.onload = function () {
    let tenMinutes = 60 * 10;
    let display = document.querySelector('#countdown');
    startTimer(tenMinutes, display);
};

// --- Fetch Products From Firebase ---
const grid = document.getElementById('productGrid');
onValue(ref(db, 'products'), (snapshot) => {
    grid.innerHTML = "";
    snapshot.forEach((child) => {
        const data = child.val();
        grid.innerHTML += `
            <div class="card">
                <img src="${data.image}">
                <div class="p-name">${data.name}</div>
                <div>
                    <span class="p-price">₹${data.discount}</span>
                    <span class="p-old">₹${data.price}</span>
                    <span class="p-off">${data.off}% off</span>
                </div>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62965a.png" style="width:60px; height:auto; margin-top:5px;">
            </div>
        `;
    });
});

