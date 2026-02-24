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

window.saveProduct = () => {
    const name = document.getElementById('pName').value;
    const img = document.getElementById('pImage').value; // Comma separated
    const mrp = document.getElementById('pMRP').value;
    const prc = document.getElementById('pPrice').value;
    const del = document.getElementById('pDelivery').value;
    const desc = document.getElementById('pDesc').value;
    const dImgs = document.getElementById('pDescImgs').value; // Comma separated

    if(name && img && prc){
        const off = Math.round(((mrp - prc) / mrp) * 100);
        push(ref(db, 'products'), { name, image: img, mrp, price: prc, del, off, desc, descImgs: dImgs })
        .then(() => { alert("Product Live!"); location.reload(); });
    }
};

window.addSlider = () => {
    const url = document.getElementById('sUrl').value;
    if(url) push(ref(db, 'sliders'), { url }).then(() => alert("Slider Added!"));
};

window.updateCat = () => {
    const url = document.getElementById('cUrl').value;
    if(url) set(ref(db, 'catStrip'), { url }).then(() => alert("Category Strip Updated!"));
};

window.deleteItem = (path) => { if(confirm("Delete?")) remove(ref(db, path)); };

// Real-time Fetching
onValue(ref(db, 'products'), (snap) => {
    const grid = document.getElementById('productGrid'), pBody = document.getElementById('pBody');
    if(grid) grid.innerHTML = ""; if(pBody) pBody.innerHTML = "";
    snap.forEach(child => {
        const p = child.val(), k = child.key;
        // Sending all data to product.html via URL
        const link = `product.html?name=${encodeURIComponent(p.name)}&img=${encodeURIComponent(p.image)}&mrp=${p.mrp}&price=${p.price}&off=${p.off}&del=${encodeURIComponent(p.del)}&desc=${encodeURIComponent(p.desc || '')}&descImgs=${encodeURIComponent(p.descImgs || '')}`;
        
        if(grid) grid.innerHTML += `
            <a href="${link}" class="card">
                <img src="${p.image.split(',')[0]}">
                <div class="p-title">${p.name}</div>
                <div><span class="p-off">${p.off}% Off</span> <span class="p-mrp">₹${p.mrp}</span></div>
                <span class="p-price">₹${p.price}</span>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62965a.png" class="assured-img">
            </a>`;
        if(pBody) pBody.innerHTML += `<tr><td><img src="${p.image.split(',')[0]}" width="30"></td><td>${p.name}</td><td>₹${p.price}</td><td><button onclick="deleteItem('products/${k}')">X</button></td></tr>`;
    });
});

// Slider & Category (same as before)
onValue(ref(db, 'sliders'), (snap) => {
    const urls = [];
    snap.forEach(c => urls.push(c.val().url));
    let i = 0; const sImg = document.getElementById('sliderImg');
    if(urls.length > 0 && sImg){ 
        sImg.src = urls[0]; 
        setInterval(() => { i = (i + 1) % urls.length; sImg.src = urls[i]; }, 3000); 
    }
});
onValue(ref(db, 'catStrip'), (snap) => { if(document.getElementById('catImgDisplay') && snap.val()) document.getElementById('catImgDisplay').src = snap.val().url; });

// Timer Logic
let t = 600; setInterval(() => { if(document.getElementById('countdown')){ let m=Math.floor(t/60), s=t%60; document.getElementById('countdown').innerText=`${m}:${s<10?'0'+s:s}`; if(t>0)t--; } }, 1000);
