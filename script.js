let cart = [];
let selectedProduct = null;
let selectedSize = null;
let selectedColor = null;

// Color selection
document.querySelectorAll('.color').forEach(color => {
    color.addEventListener('click', function() {
        // Remove selected class from siblings
        this.parentNode.querySelectorAll('.color').forEach(c => c.classList.remove('selected'));
        // Add selected class to clicked color
        this.classList.add('selected');
        selectedColor = this.dataset.color;
        
        // Change images based on color selection
        const productCard = this.closest('.product-card');
        const mainImage = productCard.querySelector('.main-image');
        const thumbnails = productCard.querySelectorAll('.thumb');
        
        if (this.dataset.color === 'Beige') {
            mainImage.src = 'img/Beige.webp';

        } else if (this.dataset.color === 'Noir') {
            mainImage.src = 'img/Black.webp';

        }
        
        // Reset thumbnail selection
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnails[0].classList.add('active');
    });
});

// Quick buy functionality
document.querySelectorAll('.quick-buy').forEach(button => {
    button.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const colorVariants = productCard.querySelector('.color-variants');
        
        // Check if product has color variants and if one is selected
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

// Modal close functionality
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('quickBuyModal').style.display = 'none';
});

// Form submission
document.getElementById('quickOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const orderData = {
        product: selectedProduct,
        customer: {
            name: this.querySelector('input[placeholder="Nom Complet"]').value,
            phone: this.querySelector('input[placeholder="Numéro de Téléphone"]').value,
            city: this.querySelector('input[placeholder="Ville"]').value
        }
    };
    
    // Send order to JSONBin
    sendOrderToJSONBin(orderData);
    
    // Close quick buy modal
    document.getElementById('quickBuyModal').style.display = 'none';
    
    // Show success modal
    document.getElementById('successModal').style.display = 'block';
    
    // Update cart count
    updateCartCount();
    
    // Reset form
    this.reset();
    
    // Send to WhatsApp (optional)
    sendToWhatsApp(orderData);
});

function updateCartCount() {
    cart.push(selectedProduct);
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

function sendOrderToJSONBin(orderData) {
    const newOrder = {
        ...orderData,
        timestamp: new Date().toISOString(),
        orderId: 'BLZ-' + Date.now()
    };
    
    fetch('https://api.jsonbin.io/v3/b/68b215b9d0ea881f406aa427', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': '$2a$10$W7Y1w05rI7FhqCSUCB/tRuDJYO2fRlTwgv2s3je3OlExS3oOz9UzG'
        },
        body: JSON.stringify(newOrder)
    })
    .then(response => {
        if (response.ok) {
            console.log('Order sent successfully');
            return response.json();
        }
        throw new Error('Network response was not ok');
    })
    .then(data => console.log('Success:', data))
    .catch(error => {
        console.error('Error:', error);
        // Fallback: try with different endpoint
        fetch('https://jsonbin.io/68b215b9d0ea881f406aa427', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newOrder)
        }).catch(e => console.error('Fallback failed:', e));
    });
}

function sendToWhatsApp(orderData) {
    const message = `🔥 NOUVELLE COMMANDE BLAZE

📦 Produit: ${orderData.product.name}
📏 Taille: ${orderData.product.size}
🎨 Couleur: ${orderData.product.color}
💰 Prix: ${orderData.product.price} DH
🚚 LIVRAISON GRATUITE

👤 Client:
${orderData.customer.name}
📱 ${orderData.customer.phone}
🏙️ ${orderData.customer.city}`;
    
    const whatsappUrl = `https://wa.me/212XXXXXXXXX?text=${encodeURIComponent(message)}`;
    // Décommentez la ligne ci-dessous pour activer l'intégration WhatsApp
    // window.open(whatsappUrl, '_blank');
}

// Close modals when clicking outside
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

// Add smooth scrolling for better mobile experience
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Thumbnail image switching
document.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const mainImage = productCard.querySelector('.main-image');
        const thumbnails = productCard.querySelectorAll('.thumb');
        
        // Remove active class from all thumbnails
        thumbnails.forEach(t => t.classList.remove('active'));
        // Add active class to clicked thumbnail
        this.classList.add('active');
        
        // Change main image
        mainImage.src = this.src.replace('80x80', '300x400');
    });
});

// Add loading animation for quick buy buttons
document.querySelectorAll('.quick-buy').forEach(button => {
    button.addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
        this.disabled = true;
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.disabled = false;
        }, 1000);
    });
});