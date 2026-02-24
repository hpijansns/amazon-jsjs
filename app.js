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

// --- ADMIN FUNCTIONS (Attached to Window for HTML Buttons) ---

window.saveProduct = () => {
    const name = document.getElementById('pName').value;
    const image = document.getElementById('pImage').value;
    const mrp = document.getElementById('pMRP').value;
    const price = document.getElementById('pPrice').value;
    const del = document.getElementById('pDelivery').value;

    if(name && image && mrp && price) {
        const offPercent = Math.round(((mrp - price) / mrp) * 100);
        push(ref(db, 'products'), {
            name, image, mrp, price, del, off: offPercent
        }).then(() => {
            alert("Product Added Successfully!");
            // Clear inputs
            document.getElementById('pName').value = "";
            document.getElementById('pImage').value = "";
        });
    } else {
        alert("Please fill all fields!");
    }
};

window.addSlider = () => {
    const url = document.getElementById('sUrl').value;
    if(url) {
        push(ref(db, 'sliders'), { url }).then(() => {
            alert("Slider Added!");
            document.getElementById('sUrl').value = "";
        });
    }
};

window.updateCat = () => {
    const url = document.getElementById('cUrl').value;
    if(url) {
        set(ref(db, 'catStrip'), { url }).then(() => {
            alert("Category Strip Updated!");
        });
    }
};

window.deleteItem = (path) => {
    if(confirm("Are you sure?")) {
        remove(ref(db, path));
    }
};

// --- REAL-TIME DATA FETCHING ---

// 1. Products Load
onValue(ref(db, 'products'), (snap) => {
    const grid = document.getElementById('productGrid');
    const pBody = document.getElementById('pBody');
    if(grid) grid.innerHTML = "";
    if(pBody) pBody.innerHTML = "";

    snap.forEach(child => {
        const p = child.val();
        const key = child.key;
        
        // UI for Index Page
        if(grid) {
            grid.innerHTML += `
            <div class="card">
                <img src="${p.image}">
                <div class="p-title">${p.name}</div>
                <div><span class="p-off">${p.off}% Off</span> <span class="p-mrp">₹${p.mrp}</span></div>
                <span class="p-price">₹${p.price}</span>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62965a.png" class="assured-img">
                <div class="p-del">${p.del}</div>
            </div>`;
        }
        
        // Table for Admin Page
        if(pBody) {
            pBody.innerHTML += `
            <tr>
                <td><img src="${p.image}" width="30"></td>
                <td>${p.name}</td>
                <td><button onclick="deleteItem('products/${key}')" style="background:red; color:white; border:none; padding:5px;">Delete</button></td>
            </tr>`;
        }
    });
});

// 2. Sliders Logic
onValue(ref(db, 'sliders'), (snap) => {
    const urls = [];
    const sList = document.getElementById('sList');
    if(sList) sList.innerHTML = "";

    snap.forEach(c => {
        const data = c.val();
        urls.push(data.url);
        if(sList) {
            sList.innerHTML += `
            <div style="position:relative;">
                <img src="${data.url}" width="100" height="50">
                <button onclick="deleteItem('sliders/${c.key}')" style="position:absolute; top:0; right:0; background:red; color:white; border:none;">X</button>
            </div>`;
        }
    });

    let i = 0;
    const sliderImg = document.getElementById('sliderImg');
    if(urls.length > 0 && sliderImg){
        sliderImg.src = urls[0]; // Set first image
        setInterval(() => {
            i = (i + 1) % urls.length;
            sliderImg.src = urls[i];
        }, 3000);
    }
});

// 3. Category Strip Logic
onValue(ref(db, 'catStrip'), (snap) => {
    const img = document.getElementById('catImgDisplay');
    if(img && snap.val()) img.src = snap.val().url;
});

// 4. Timer Logic (10 Minutes)
let time = 600;
const countdownEl = document.getElementById('countdown');
if(countdownEl) {
    setInterval(() => {
        let min = Math.floor(time / 60);
        let sec = time % 60;
        countdownEl.innerHTML = `${min}:${sec < 10 ? '0'+sec : sec}`;
        if(time > 0) time--;
    }, 1000);
}
