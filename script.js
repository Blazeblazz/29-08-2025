let cart = [];
let selectedProduct = null;
let selectedSize = null;
let selectedColor = null;

// Color selection
document.querySelectorAll('.color').forEach(color => {
    color.addEventListener('click', function() {
        this.parentNode.querySelectorAll('.color').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedColor = this.dataset.color;
        
        const productCard = this.closest('.product-card');
        const mainImage = productCard.querySelector('.main-image');
        const thumbnails = productCard.querySelectorAll('.thumb');
        
        if (this.dataset.color === 'Beige') {
            mainImage.src = 'img/Beige.webp';
        } else if (this.dataset.color === 'Noir') {
            mainImage.src = 'img/Black.webp';
        }
        
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnails[0].classList.add('active');
    });
});

// Quick buy functionality
document.querySelectorAll('.quick-buy').forEach(button => {
    button.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const colorVariants = productCard.querySelector('.color-variants');
        
        if (colorVariants && !productCard.querySelector('.color.selected')) {
            alert('Veuillez sélectionner une couleur!');
            return;
        }
        
        selectedProduct = {
            name: productCard.querySelector('h3').textContent,
            price: this.dataset.price,
            size: 'One Size',
            color: selectedColor || 'Standard',
            type: this.dataset.product
        };
        
        showQuickBuyModal();
    });
});

function showQuickBuyModal() {
    const modal = document.getElementById('quickBuyModal');
    const productDetails = modal.querySelector('.product-details');
    const total = modal.querySelector('.total');
    
    productDetails.innerHTML = `
        <h4>${selectedProduct.name}</h4>
        <p><strong>Taille:</strong> ${selectedProduct.size} (Compatible avec S M L)</p>
        <p><strong>Couleur:</strong> ${selectedProduct.color}</p>
        <p><strong>Prix:</strong> ${selectedProduct.price} DH</p>
        <p style="color: #16a34a; font-weight: 600;"><strong>🚚 LIVRAISON GRATUITE</strong></p>
    `;
    
    total.textContent = `TOTAL: ${selectedProduct.price} DH`;
    modal.style.display = 'block';
}

document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('quickBuyModal').style.display = 'none';
});

document.getElementById('quickOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const orderData = {
        product: selectedProduct,
        customer: {
            name: this.querySelector('input[placeholder="Nom Complet"]').value,
            phone: this.querySelector('input[placeholder="Numéro de Téléphone"]').value,
            city: this.querySelector('input[placeholder="Ville"]').value
        }
    };
    
    sendOrderToJSONBin(orderData);
    
    document.getElementById('quickBuyModal').style.display = 'none';
    document.getElementById('successModal').style.display = 'block';
    
    updateCartCount();
    this.reset();
});

async function sendOrderToJSONBin(orderData) {
    try {
        const getResponse = await fetch('https://api.jsonbin.io/v3/b/68bd8750d0ea881f4074f432/latest', {
            headers: {
                'X-Master-Key': '$2a$10$W7Y1w05rI7FhqCSUCB/tRuDJYO2fRlTwgv2s3je3OlExS3oOz9UzG'
            }
        });
        
        let orders = [];
        if (getResponse.ok) {
            const data = await getResponse.json();
            orders = Array.isArray(data.record) ? data.record : [];
        }
        
        const newOrder = {
            ...orderData,
            timestamp: new Date().toISOString(),
            orderId: 'BLZ-' + Date.now()
        };
        
        orders.push(newOrder);
        
        const response = await fetch('https://api.jsonbin.io/v3/b/68bd8750d0ea881f4074f432', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': '$2a$10$W7Y1w05rI7FhqCSUCB/tRuDJYO2fRlTwgv2s3je3OlExS3oOz9UzG'
            },
            body: JSON.stringify(orders)
        });
        
        if (response.ok) {
            console.log('Order saved:', orders.length, 'total orders');
            sendOrderToGoogleSheets(newOrder);
        }
    } catch (error) {
        console.error('JSONBin error:', error);
    }
}

function sendOrderToGoogleSheets(orderData) {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdt8vk-jy0Hisfp-fv1BvQJcFVBHOgPFQawwWmQuiFCgzqFBA3f2JcULLRNRzU6qMGcQ/exec';
    
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(() => console.log('Sent to Google Sheets'))
    .catch(error => console.error('Google Sheets error:', error));
}

function updateCartCount() {
    cart.push(selectedProduct);
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

window.addEventListener('click', function(event) {
    const quickBuyModal = document.getElementById('quickBuyModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === quickBuyModal) {
        quickBuyModal.style.display = 'none';
    }
    if (event.target === successModal) {
        successModal.style.display = 'none';
    }
});

document.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const mainImage = productCard.querySelector('.main-image');
        const thumbnails = productCard.querySelectorAll('.thumb');
        
        thumbnails.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        mainImage.src = this.src.replace('80x80', '300x400');
    });
});