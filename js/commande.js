// ===== SCRIPT POUR LA PAGE COMMANDE =====
// Version corrigée - Le bouton de commande fonctionne correctement

// ===== VALIDATION DES NUMÉROS DE TÉLÉPHONE CONGOLAIS =====
function validatePhone(phone) {
    if (!phone) return false;
    
    // Supprimer tous les espaces, tirets, parenthèses et points
    let cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Retirer le + s'il est présent
    if (cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.substring(1);
    }
    
    // Vérifier les différents formats possibles
    if (cleanPhone.length === 12 && cleanPhone.startsWith('243')) {
        return true;
    }
    if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
        return true;
    }
    if (cleanPhone.length === 9 && /^[1-9]/.test(cleanPhone)) {
        return true;
    }
    
    return false;
}

function cleanPhoneNumber(phone) {
    if (!phone) return '';
    let clean = phone.replace(/[\s\-\(\)\.]/g, '');
    if (clean.startsWith('+')) {
        clean = clean.substring(1);
    }
    return clean;
}

// ===== FONCTIONS DU PANIER =====
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
}

function getGroupedCart() {
    const cart = getCart();
    const grouped = {};
    
    cart.forEach(item => {
        const key = item.name + '-' + item.price;
        if (grouped[key]) {
            grouped[key].quantity += item.quantity || 1;
        } else {
            grouped[key] = {
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            };
        }
    });
    
    return Object.values(grouped);
}

function formatPrice(price) {
    return price.toLocaleString() + ' FC';
}

function showNotification(title, message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    notification.style.color = 'white';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.minWidth = '300px';
    notification.style.display = 'flex';
    notification.style.justifyContent = 'space-between';
    notification.style.alignItems = 'center';
    notification.style.gap = '1rem';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ===== CHARGEMENT DU PANIER =====
function loadCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    const groupedCart = getGroupedCart();
    
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
        const safeName = item.name.replace(/'/g, "\\'");
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateQuantity('${safeName}', ${item.price}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${safeName}', ${item.price}, 1)">+</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = formatPrice(total);
}

function updateQuantity(name, price, change) {
    let cart = getCart();
    
    if (change > 0) {
        cart.push({ name: name, price: price, quantity: 1 });
    } else {
        const index = cart.findIndex(item => item.name === name && item.price === price);
        if (index !== -1) {
            cart.splice(index, 1);
        }
    }
    
    saveCart(cart);
    loadCart();
}

function clearCart() {
    if (confirm('Voulez-vous vraiment vider votre panier ?')) {
        localStorage.removeItem('cart');
        loadCart();
    }
}
// Fonction pour sauvegarder la commande en base de données
async function saveOrderToDatabase(order) {
    try {
        const response = await fetch('api/save-order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Commande sauvegardée en base de données');
            return true;
        } else {
            console.error('❌ Erreur:', result.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        return false;
    }
}
// ===== FONCTION POUR METTRE À JOUR L'ÉTAT DU BOUTON =====
function updateOrderButtonState() {
    const paymentMode = document.getElementById('payment-mode')?.value || 'cash';
    const submitBtn = document.getElementById('submit-order');
    
    if (!submitBtn) return;
    
    if (paymentMode === 'cash') {
        // Mode cash : toujours activé
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Confirmer la commande (Cash)';
    } else {
        // Mode en ligne : vérifier si un opérateur est sélectionné
        const paymentMethod = document.getElementById('payment-method');
        const selectedOperator = paymentMethod ? paymentMethod.value : '';
        
        if (selectedOperator && selectedOperator !== '') {
            // Opérateur sélectionné : activer le bouton
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Confirmer la commande (Mobile Money)';
        } else {
            // Aucun opérateur : désactiver le bouton
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.innerHTML = '<i class="fas fa-hourglass"></i> Choisissez un opérateur';
        }
    }
}

// ===== AFFICHER LE NUMÉRO DE PAIEMENT =====
function showPaymentNumber(operator) {
    // Cacher tous les numéros
    const numbers = ['airtel-number', 'orange-number', 'vodacom-number', 'africell-number'];
    numbers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    // Afficher le numéro choisi
    if (operator && operator !== '') {
        const selectedNumber = document.getElementById(operator);
        if (selectedNumber) {
            selectedNumber.style.display = 'block';
        }
    }
    
    // Mettre à jour l'état du bouton
    updateOrderButtonState();
}

// ===== GESTION DU MODE DE PAIEMENT =====
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
    
    // Mettre à jour l'état du bouton
    updateOrderButtonState();
}

// ===== VALIDATION DU TÉLÉPHONE EN TEMPS RÉEL =====
function setupPhoneValidation() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function() {
        const value = this.value;
        let errorMsg = document.getElementById('phone-error');
        
        if (value.length > 0) {
            const isValid = validatePhone(value);
            
            if (!isValid) {
                this.style.borderColor = '#dc3545';
                this.style.backgroundColor = '#fff0f0';
                
                if (!errorMsg) {
                    errorMsg = document.createElement('small');
                    errorMsg.id = 'phone-error';
                    errorMsg.style.color = '#dc3545';
                    errorMsg.style.display = 'block';
                    errorMsg.style.marginTop = '0.3rem';
                    this.parentNode.appendChild(errorMsg);
                }
                errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Formats acceptés: +243812345678, 0812345678 ou 812345678';
            } else {
                this.style.borderColor = '#28a745';
                this.style.backgroundColor = '#f0fff0';
                if (errorMsg) errorMsg.remove();
            }
        } else {
            this.style.borderColor = '#e0e0e0';
            this.style.backgroundColor = 'white';
            if (errorMsg) errorMsg.remove();
        }
    });
}

// ===== PASSER LA COMMANDE =====
async function placeOrder(event) {
    event.preventDefault();
    
    const cart = getCart();
    
    if (cart.length === 0) {
        showNotification('Panier vide', 'Ajoutez des articles avant de commander', 'error');
        return;
    }
    
    const name = document.getElementById('name')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const deliveryTime = document.getElementById('delivery-time')?.value || 'dès que possible';
    const paymentMode = document.getElementById('payment-mode')?.value || 'cash';
    
    if (!name.trim()) {
        showNotification('Erreur', 'Veuillez entrer votre nom complet', 'error');
        return;
    }
    
    if (!phone.trim()) {
        showNotification('Erreur', 'Veuillez entrer votre numéro de téléphone', 'error');
        return;
    }
    
    if (!validatePhone(phone)) {
        showNotification('Erreur', 'Numéro invalide. Formats acceptés: +243812345678, 0812345678 ou 812345678', 'error');
        return;
    }
    
    if (!address.trim()) {
        showNotification('Erreur', 'Veuillez entrer votre adresse de livraison', 'error');
        return;
    }
    
    let paymentDetails = null;
    if (paymentMode === 'online') {
        const paymentMethod = document.getElementById('payment-method')?.value;
        if (!paymentMethod) {
            showNotification('Erreur', 'Veuillez choisir un opérateur Mobile Money', 'error');
            return;
        }
        
        let paymentNumber = '';
        switch(paymentMethod) {
            case 'airtel-number':
                paymentNumber = '+243 812 345 678';
                break;
            case 'orange-number':
                paymentNumber = '+243 892 345 678';
                break;
            case 'vodacom-number':
                paymentNumber = '+243 992 345 678';
                break;
            case 'africell-number':
                paymentNumber = '+243 972 345 678';
                break;
        }
        
        paymentDetails = {
            method: paymentMethod,
            number: paymentNumber,
            phone: document.getElementById('payment-phone')?.value || ''
        };
    }
    
    const total = getCartTotal();
    const cleanPhone = cleanPhoneNumber(phone);
    
    const order = {
        id: Date.now(),
        customer: {
            name: name.trim(),
            phone: cleanPhone,
            address: address.trim()
        },
        items: cart,
        total: total,
        deliveryTime: deliveryTime,
        paymentMode: paymentMode,
        paymentDetails: paymentDetails,
        status: paymentMode === 'online' ? 'payé' : 'en attente de paiement',
        date: new Date().toISOString()
    };
    
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Sauvegarder en base de données
const saved = await saveOrderToDatabase(order);
if (saved) {
    console.log('✅ Commande sauvegardée en base de données');
} else {
    console.log('⚠️ Commande sauvegardée uniquement en local');
}
    
    let message = `✅ COMMANDE CONFIRMÉE #${order.id}\n\n`;
    message += `Merci ${order.customer.name} !\n\n`;
    message += `📦 Total: ${formatPrice(order.total)}\n`;
    message += `Mode: ${order.paymentMode === 'online' ? 'Mobile Money' : 'Cash à la livraison'}\n`;
    
    if (order.paymentMode === 'online') {
        message += `\n📱 Envoyez ${formatPrice(order.total)} à : ${order.paymentDetails.number}\n`;
    } else {
        message += `\n💰 Préparez ${formatPrice(order.total)} en cash.`;
    }
    
    message += `\n\n🚚 Livraison à: ${order.customer.address}`;
    message += `\n📞 Contact: ${order.customer.phone}`;
    
    alert(message);
    
    localStorage.removeItem('cart');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}


// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Charger le panier
    loadCart();
    
    // Initialiser le mode de paiement (cash par défaut)
    selectPayment('cash');
    
    // Configurer la validation du téléphone
    setupPhoneValidation();
    
    // Écouteur pour le changement d'opérateur
    const paymentMethod = document.getElementById('payment-method');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            showPaymentNumber(this.value);
        });
    }
    
    // Écouteur pour le formulaire
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', placeOrder);
    }
});

// Exposer les fonctions globales
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.selectPayment = selectPayment;
window.placeOrder = placeOrder;
window.showPaymentNumber = showPaymentNumber;