import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- Firebase Configuration ---
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

// ==========================================
// 1. ADMIN PANEL FUNCTIONS (Global Window)
// ==========================================

// Add Product Logic
window.saveProduct = () => {
    const name = document.getElementById('pName').value;
    const img = document.getElementById('pImage').value; // Multi-images via comma
    const mrp = document.getElementById('pMRP').value;
    const prc = document.getElementById('pPrice').value;
    const del = document.getElementById('pDelivery').value;
    const desc = document.getElementById('pDesc').value;
    const dImgs = document.getElementById('pDescImgs').value; // Desc-images via comma

    if(name && img && prc){
        const off = Math.round(((mrp - prc) / mrp) * 100);
        push(ref(db, 'products'), { 
            name, image: img, mrp, price: prc, del, off, desc, descImgs: dImgs 
        }).then(() => { 
            alert("Success: Product is now Live!"); 
            location.reload(); 
        });
    } else {
        alert("Please fill Name, Main Image, and Price!");
    }
};

// Add Slider Banner
window.addSlider = () => {
    const url = document.getElementById('sUrl').value;
    if(url) {
        push(ref(db, 'sliders'), { url }).then(() => {
            alert("Banner Added!");
            document.getElementById('sUrl').value = "";
        });
    }
};

// Update Category Strip Image
window.updateCat = () => {
    const url = document.getElementById('cUrl').value;
    if(url) {
        set(ref(db, 'catStrip'), { url }).then(() => alert("Category Strip Updated!"));
    }
};

// Delete Item Logic
window.deleteItem = (path) => {
    if(confirm("Are you sure you want to delete this?")) {
        remove(ref(db, path));
    }
};

// ==========================================
// 2. LIVE DATA SYNC (Index & Admin)
// ==========================================

// --- Load Products ---
onValue(ref(db, 'products'), (snap) => {
    const grid = document.getElementById('productGrid');
    const pBody = document.getElementById('pBody');
    if(grid) grid.innerHTML = "";
    if(pBody) pBody.innerHTML = "";

    snap.forEach(child => {
        const p = child.val();
        const k = child.key;
        
        // Handling Multiple Images: Take the first one for the thumbnail
        const firstImg = p.image.split(',')[0].trim();

        // Safe URL for Product Details Page
        const detailUrl = `product.html?name=${encodeURIComponent(p.name)}&img=${encodeURIComponent(p.image)}&mrp=${p.mrp}&price=${p.price}&off=${p.off}&del=${encodeURIComponent(p.del)}&desc=${encodeURIComponent(p.desc || '')}&descImgs=${encodeURIComponent(p.descImgs || '')}`;

        // UI for Index Page Grid
        if(grid) {
            grid.innerHTML += `
            <a href="${detailUrl}" class="card">
                <img src="${firstImg}" loading="lazy">
                <div class="p-title">${p.name}</div>
                <div><span class="p-off">${p.off}% Off</span> <span class="p-mrp">₹${p.mrp}</span></div>
                <span class="p-price">₹${p.price}</span>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62965a.png" class="assured-img">
                <div class="p-del">${p.del || 'Free Delivery'}</div>
            </a>`;
        }
        
        // UI for Admin Table
        if(pBody) {
            pBody.innerHTML += `
            <tr>
                <td><img src="${firstImg}" width="40" height="40" style="object-fit:contain"></td>
                <td style="font-size:12px;">${p.name.substring(0, 20)}...</td>
                <td>₹${p.price}</td>
                <td><button onclick="deleteItem('products/${k}')" style="background:#ff4444; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">X</button></td>
            </tr>`;
        }
    });
});

// --- Load Slider Banners ---
onValue(ref(db, 'sliders'), (snap) => {
    const urls = [];
    const sList = document.getElementById('sList');
    if(sList) sList.innerHTML = "";

    snap.forEach(c => {
        const d = c.val();
        urls.push(d.url);
        if(sList) {
            sList.innerHTML += `
            <div style="position:relative; flex-shrink:0;">
                <img src="${d.url}" width="120" height="60" style="border:1px solid #ddd; border-radius:4px;">
                <button onclick="deleteItem('sliders/${c.key}')" style="position:absolute; top:-5px; right:-5px; background:black; color:white; border-radius:50%; width:20px; height:20px; border:none; font-size:10px; cursor:pointer;">X</button>
            </div>`;
        }
    });

    // Auto-Play Logic for Index Slider
    let i = 0;
    const sliderImg = document.getElementById('sliderImg');
    if(urls.length > 0 && sliderImg) {
        sliderImg.src = urls[0];
        // Clear previous intervals if any
        if(window.sliderInterval) clearInterval(window.sliderInterval);
        window.sliderInterval = setInterval(() => {
            i = (i + 1) % urls.length;
            sliderImg.src = urls[i];
        }, 3500); // 3.5 seconds
    }
});

// --- Load Category Strip ---
onValue(ref(db, 'catStrip'), (snap) => {
    const catDisp = document.getElementById('catImgDisplay');
    if(catDisp && snap.val()) {
        catDisp.src = snap.val().url;
    }
});

// --- 10-Minute Timer Logic ---
let secondsRemaining = 600; 
const timerDiv = document.getElementById('countdown');
if(timerDiv) {
    setInterval(() => {
        let mins = Math.floor(secondsRemaining / 60);
        let secs = secondsRemaining % 60;
        timerDiv.innerText = `${mins}:${secs < 10 ? '0' + secs : secs}`;
        if(secondsRemaining > 0) secondsRemaining--;
    }, 1000);
}
