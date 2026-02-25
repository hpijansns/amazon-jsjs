import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// --- 1. Load Home Products (Index.html) ---
const productGrid = document.getElementById('productGrid');
if (productGrid) {
    onValue(ref(db, 'products'), (snapshot) => {
        productGrid.innerHTML = ""; // Clear existing
        snapshot.forEach((child) => {
            const data = child.val();
            // First image for thumbnail
            const firstImg = data.image.split(',')[0].trim();
            
            // Build URL with all data to pass to details page
            const params = new URLSearchParams({
                name: data.name,
                price: data.price,
                mrp: data.mrp,
                off: data.off,
                img: data.image, // Pass all image links
                desc: data.description || data.desc || "",
                descImgs: data.descImgs || ""
            });

            productGrid.innerHTML += `
                <a href="product-details.html?${params.toString()}" class="card">
                    <div class="img-box"><img src="${firstImg}"></div>
                    <div class="p-title">${data.name}</div>
                    <div class="p-price">₹${data.price} <span class="p-mrp">₹${data.mrp}</span></div>
                    <div class="p-off">${data.off}% Off</div>
                    <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62965a.png" class="assured-img">
                </a>`;
        });
    });
}

// --- 2. Load Slider & Category (Index.html) ---
const sliderImg = document.getElementById('sliderImg');
if (sliderImg) {
    onValue(ref(db, 'sliders'), (snapshot) => {
        const urls = [];
        snapshot.forEach(c => urls.push(c.val().url));
        if (urls.length > 0) {
            let i = 0;
            sliderImg.src = urls[0];
            setInterval(() => {
                i = (i + 1) % urls.length;
                sliderImg.src = urls[i];
            }, 3000);
        }
    });
}

const catImgDisplay = document.getElementById('catImgDisplay');
if (catImgDisplay) {
    onValue(ref(db, 'catStrip'), (snapshot) => {
        const data = snapshot.val();
        if (data && data.url) catImgDisplay.src = data.url;
    });
}

// --- 3. Save Product (Admin.html Function) ---
window.saveProduct = () => {
    const name = document.getElementById('pName').value;
    const images = document.getElementById('pImage').value;
    const mrp = document.getElementById('pMRP').value;
    const price = document.getElementById('pPrice').value;
    const desc = document.getElementById('pDesc').value;
    const descImgs = document.getElementById('pDescImgs').value;

    if (name && images && price) {
        const off = Math.round(((mrp - price) / mrp) * 100);
        push(ref(db, 'products'), {
            name, image: images, mrp, price, off, description: desc, descImgs
        }).then(() => {
            alert("Product Added Successfully!");
            location.reload();
        });
    } else {
        alert("Please fill Name, Image and Price!");
    }
};
