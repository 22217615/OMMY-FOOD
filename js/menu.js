     
        // Fonction pour ajouter au panier (utilise localStorage)
        function addToCart(itemName, price) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push({
                name: itemName,
                price: price,
                quantity: 1
            });
            localStorage.setItem('cart', JSON.stringify(cart));
            alert(itemName + ' a été ajouté à votre commande!');
        }
    