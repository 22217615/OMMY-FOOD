// ===== SCRIPT POUR LA PAGE COMMANDE =====

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    selectPayment('cash');
    
    // Ajouter les écouteurs d'événements
    setupEventListeners();
});

function setupEventListeners() {
    // Validation du formulaire en temps réel
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (!validatePhone(this.value)) {
                this.style.borderColor = 'red';
            } else {
                this.style.borderColor = 'green';
            }
        });
    }
}

// Charger le panier
function loadCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    const groupedCart = Cart.groupItems();
    
    if (groupedCart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Votre panier est vide</p>';
        cartTotal.textContent = '0 FC';
        return;
    }
    
    let html = '';
    let total = 0;
    
    groupedCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateQuantity('${item.name}', ${item.price}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', ${item.price}, 1)">+</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = formatPrice(total);
}

// Mettre à jour la quantité
function updateQuantity(name, price, change) {
    let cart = Cart.get();
    
    if (change > 0) {
        // Ajouter un article
        cart.push({ name, price, quantity: 1 });
    } else {
        // Retirer un article
        const index = cart.findIndex(item => item.name === name && item.price === price);
        if (index !== -1) {
            cart.splice(index, 1);
        }
    }
    
    Cart.save(cart);
    loadCart();
}

// Vider le panier
function clearCart() {
    if (confirm('Voulez-vous vraiment vider votre panier ?')) {
        Cart.clear();
        loadCart();
    }
}

// Sélectionner le mode de paiement
function selectPayment(mode) {
    const payOnline = document.getElementById('pay-online');
    const payCash = document.getElementById('pay-cash');
    const onlineDetails = document.getElementById('online-payment-details');
    const cashDetails = document.getElementById('cash-payment-details');
    const paymentMode = document.getElementById('payment-mode');
    
    if (mode === 'online') {
        payOnline.classList.add('selected');
        payCash.classList.remove('selected');
        onlineDetails.style.display = 'block';
        cashDetails.style.display = 'none';
        paymentMode.value = 'online';
    } else {
        payCash.classList.add('selected');
        payOnline.classList.remove('selected');
        cashDetails.style.display = 'block';
        onlineDetails.style.display = 'none';
        paymentMode.value = 'cash';
    }
}

// Fonction pour afficher le numéro selon l'opérateur choisi
function showPaymentNumber(operator) {
    // Cacher tous les numéros d'abord
    document.getElementById('airtel-number').style.display = 'none';
    document.getElementById('orange-number').style.display = 'none';
    document.getElementById('vodacom-number').style.display = 'none';
    document.getElementById('africell-number').style.display = 'none';
    
    // Afficher celui qui correspond
    if (operator === 'airtel-money') {
        document.getElementById('airtel-number').style.display = 'block';
    } else if (operator === 'orange-money') {
        document.getElementById('orange-number').style.display = 'block';
    } else if (operator === 'vodacom-mpesa') {
        document.getElementById('vodacom-number').style.display = 'block';
    } else if (operator === 'africell-money') {
        document.getElementById('africell-number').style.display = 'block';
    }
}

// Passer la commande
function placeOrder(event) {
    event.preventDefault();
    
    const cart = Cart.get();
    
    if (cart.length === 0) {
        showNotification('Votre panier est vide. Ajoutez des articles avant de commander.', 'error');
        return;
    }
    
    // Récupérer les données du formulaire
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        deliveryTime: document.getElementById('delivery-time').value,
        paymentMode: document.getElementById('payment-mode').value
    };
    
    // Validation
    if (!formData.name || !formData.phone || !formData.address) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    if (!validatePhone(formData.phone)) {
        showNotification('Numéro de téléphone invalide', 'error');
        return;
    }
    
    // Calculer le total
    const total = Cart.getTotal();
    
    // Créer la commande
    const order = {
        id: Orders.generateId(),
        customer: formData,
        items: cart,
        total: total,
        paymentDetails: formData.paymentMode === 'online' ? {
            method: document.getElementById('payment-method').value,
            phone: document.getElementById('payment-phone').value
        } : null,
        status: 'en attente',
        date: new Date().toISOString()
    };
    
    // Sauvegarder la commande
    Orders.add(order);
    
    // Message de confirmation
    showConfirmation(order);
    
    // Vider le panier
    Cart.clear();
    
    // Rediriger
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

function showConfirmation(order) {
    let message = `Merci ${order.customer.name} !\n\n`;
    message += `Commande #${order.id}\n`;
    message += `Total: ${formatPrice(order.total)}\n`;
    message += `Paiement: ${order.customer.paymentMode === 'online' ? 'En ligne' : 'Cash à la livraison'}\n\n`;
    message += `Livraison à: ${order.customer.address}\n`;
    message += `Téléphone: ${order.customer.phone}\n\n`;
    
    if (order.customer.paymentMode === 'online') {
        message += `Vous allez recevoir une demande de paiement sur votre téléphone.`;
    } else {
        message += `Préparez ${formatPrice(order.total)} en cash pour la livraison.`;
    }
    
    alert(message);
}