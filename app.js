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
const database = getDatabase(app);

// --- Admin: Save Product ---
window.saveProduct = () => {
    const name = document.getElementById('pName').value;
    const images = document.getElementById('pImage').value; 
    const mrp = document.getElementById('pMRP').value;
    const price = document.getElementById('pPrice').value;
    const desc = document.getElementById('pDesc').value;
    const descImgs = document.getElementById('pDescImgs').value;

    if(name && images && price) {
        const discount = Math.round(((mrp - price) / mrp) * 100);
        push(ref(database, 'products'), {
            name, image: images, mrp, price, off: discount, desc, descImgs
        }).then(() => { alert("Success!"); location.reload(); });
    }
};

// --- Home Page: Load Products ---
onValue(ref(database, 'products'), (snapshot) => {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    grid.innerHTML = "";
    
    snapshot.forEach(child => {
        const data = child.val();
        // Fix: Remove empty/extra commas to prevent invisible cards
        const imageList = data.image.split(',').map(img => img.trim()).filter(Boolean);
        const thumb = imageList[0];

        const detailUrl = `product.html?name=${encodeURIComponent(data.name)}&img=${encodeURIComponent(data.image)}&mrp=${data.mrp}&price=${data.price}&off=${data.off}&desc=${encodeURIComponent(data.desc || '')}&descImgs=${encodeURIComponent(data.descImgs || '')}`;

        grid.innerHTML += `
            <a href="${detailUrl}" class="card">
                <div class="img-box"><img src="${thumb}"></div>
                <div class="p-title">${data.name}</div>
                <div><span class="p-off">${data.off}% Off</span> <span class="p-mrp">₹${data.mrp}</span></div>
                <div class="p-price">₹${data.price}</div>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62965a.png" class="assured-img">
            </a>`;
    });
});

// --- Slider & Category ---
onValue(ref(database, 'sliders'), (snap) => {
    const urls = []; snap.forEach(c => urls.push(c.val().url));
    const sImg = document.getElementById('sliderImg');
    if(urls.length > 0 && sImg){ 
        let i = 0; sImg.src = urls[0]; 
        setInterval(() => { i = (i + 1) % urls.length; sImg.src = urls[i]; }, 3000); 
    }
});

onValue(ref(database, 'catStrip'), (snap) => {
    if(document.getElementById('catImgDisplay') && snap.val()) 
        document.getElementById('catImgDisplay').src = snap.val().url;
});
