// ===== FONCTIONS COMMUNES =====

// Gestion du panier
const Cart = {
    // Récupérer le panier
    get: function() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },
    
    // Sauvegarder le panier
    save: function(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    },
    
    // Ajouter un article
    add: function(item) {
        const cart = this.get();
        cart.push(item);
        this.save(cart);
        return cart;
    },
    
    // Vider le panier
    clear: function() {
        localStorage.removeItem('cart');
    },
    
    // Calculer le total
    getTotal: function() {
        const cart = this.get();
        return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    },
    
    // Grouper les articles identiques
    groupItems: function() {
        const cart = this.get();
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
};

// Gestion des commandes
const Orders = {
    // Récupérer toutes les commandes
    getAll: function() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    },
    
    // Ajouter une commande
    add: function(order) {
        const orders = this.getAll();
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        return order;
    },
    
    // Générer un ID unique
    generateId: function() {
        return Date.now();
    }
};

// Formatage monétaire
function formatPrice(price) {
    return price.toLocaleString() + ' FC';
}

// Afficher une notification
function showNotification(message, type = 'success') {
    // À implémenter si besoin
    alert(message);
}

// Validation de téléphone congolais
function validatePhone(phone) {
    const regex = /^(\+243|0)[1-9]{9}$/;
    return regex.test(phone.replace(/\s/g, ''));
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Mettre à jour le compteur du panier si présent
    updateCartCounter();
});

function updateCartCounter() {
    const cart = Cart.get();
    const counter = document.getElementById('cart-counter');
    if (counter) {
        counter.textContent = cart.length;
    }
}