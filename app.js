import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// --- ADMIN FUNCTIONS ---
window.saveProduct = () => {
    const data = {
        name: document.getElementById('pName').value,
        image: document.getElementById('pImage').value,
        mrp: document.getElementById('pMRP').value,
        price: document.getElementById('pPrice').value,
        del: document.getElementById('pDelivery').value,
        off: Math.round(((document.getElementById('pMRP').value - document.getElementById('pPrice').value) / document.getElementById('pMRP').value) * 100)
    };
    push(ref(db, 'products'), data);
};

window.addSlider = () => {
    const url = document.getElementById('sUrl').value;
    push(ref(db, 'sliders'), { url });
};

window.updateCat = () => {
    const url = document.getElementById('cUrl').value;
    set(ref(db, 'catStrip'), { url });
};

// --- REAL-TIME UPDATES (FOR BOTH PAGES) ---

// 1. Products
onValue(ref(db, 'products'), (snap) => {
    const grid = document.getElementById('productGrid');
    const pBody = document.getElementById('pBody');
    if(grid) grid.innerHTML = "";
    if(pBody) pBody.innerHTML = "";

    snap.forEach(child => {
        const p = child.val();
        if(grid) grid.innerHTML += `
            <div class="card">
                <img src="${p.image}">
                <div class="p-title">${p.name}</div>
                <div><span class="p-off">${p.off}% Off</span> <span class="p-mrp">₹${p.mrp}</span></div>
                <span class="p-price">₹${p.price}</span>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62965a.png" class="assured-img">
                <div class="p-del">${p.del}</div>
            </div>`;
        if(pBody) pBody.innerHTML += `<tr><td><img src="${p.image}" width="30"></td><td>${p.name}</td><td><button onclick="remove('${child.key}')">X</button></td></tr>`;
    });
});

// 2. Sliders
onValue(ref(db, 'sliders'), (snap) => {
    const urls = [];
    snap.forEach(c => urls.push(c.val().url));
    let i = 0;
    if(urls.length > 0 && document.getElementById('sliderImg')){
        setInterval(() => {
            document.getElementById('sliderImg').src = urls[i];
            i = (i + 1) % urls.length;
        }, 3000);
    }
});

// 3. Category Strip
onValue(ref(db, 'catStrip'), (snap) => {
    const img = document.getElementById('catImgDisplay');
    if(img && snap.val()) img.src = snap.val().url;
});

// 4. Timer
let time = 600;
setInterval(() => {
    let min = Math.floor(time / 60);
    let sec = time % 60;
    if(document.getElementById('countdown'))
        document.getElementById('countdown').innerHTML = `${min}:${sec < 10 ? '0'+sec : sec}`;
    time--;
}, 1000);
