// ===== SCRIPT POUR LA PAGE CONTACT =====

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    setupContactForm();
    setupFaqAccordion();
    initMapInteractions();
});

// Configuration du formulaire de contact
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Validation en temps réel
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    // Soumission du formulaire
    form.addEventListener('submit', handleFormSubmit);
}

// Validation d'un champ
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch(field.id) {
        case 'name':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Le nom doit contenir au moins 2 caractères';
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Veuillez entrer un email valide';
            }
            break;
            
        case 'phone':
            const phoneRegex = /^(\+243|0)[1-9]{9}$/;
            if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Numéro de téléphone invalide (ex: +243 XXX XXX XXX)';
            }
            break;
            
        case 'subject':
            if (value.length < 3) {
                isValid = false;
                errorMessage = 'Veuillez choisir un sujet';
            }
            break;
            
        case 'message':
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Le message doit contenir au moins 10 caractères';
            }
            break;
    }

    // Afficher l'erreur
    const errorElement = document.getElementById(`${field.id}Error`);
    if (errorElement) {
        if (!isValid) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            field.classList.add('error');
            field.style.borderColor = '#dc3545';
        } else {
            errorElement.style.display = 'none';
            field.classList.remove('error');
            field.style.borderColor = '#e0e0e0';
        }
    }

    return isValid;
}

// Gestion de la soumission du formulaire
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;

    // Valider tous les champs
    const inputs = form.querySelectorAll('input, textarea, select');
    let isFormValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        showNotification('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }

    // Récupérer les données
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        date: new Date().toISOString()
    };

    // Afficher le chargement
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    submitBtn.disabled = true;

    try {
        // Simuler un envoi (à remplacer par un vrai appel API)
        await simulateSend(formData);
        
        // Afficher le message de succès
        showNotification(
            'Message envoyé !',
            `Merci ${formData.name}, nous vous répondrons dans les plus brefs délais.`,
            'success'
        );
        
        // Réinitialiser le formulaire
        form.reset();
        
        // Sauvegarder dans l'historique des contacts (localStorage)
        saveContactToHistory(formData);
        
    } catch (error) {
        showNotification(
            'Erreur',
            'Une erreur est survenue. Veuillez réessayer plus tard.',
            'error'
        );
    } finally {
        // Restaurer le bouton
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Simuler l'envoi (à remplacer par un vrai fetch)
function simulateSend(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Message envoyé:', data);
            resolve();
        }, 1500);
    });
}

// Sauvegarder le contact dans l'historique
function saveContactToHistory(contactData) {
    let history = JSON.parse(localStorage.getItem('contactHistory')) || [];
    history.push({
        ...contactData,
        id: Date.now(),
        status: 'nouveau'
    });
    localStorage.setItem('contactHistory', JSON.stringify(history));
}

// Afficher une notification
function showNotification(title, message, type = 'success') {
    // Supprimer les anciennes notifications
    const oldToasts = document.querySelectorAll('.toast-notification');
    oldToasts.forEach(toast => toast.remove());

    // Créer la notification
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    document.body.appendChild(toast);

    // Auto-supprimer après 5 secondes
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Configuration de la FAQ (accordéon)
function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('h4');
        const answer = item.querySelector('p');
        
        if (question && answer) {
            // Cacher les réponses au départ
            if (!item.classList.contains('expanded')) {
                answer.style.display = 'none';
            }
            
            question.addEventListener('click', () => {
                const isExpanded = item.classList.toggle('expanded');
                answer.style.display = isExpanded ? 'block' : 'none';
                
                // Changer l'icône
                const icon = question.querySelector('i');
                if (icon) {
                    icon.className = isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
                }
            });
            
            // Style pour rendre la question cliquable
            question.style.cursor = 'pointer';
            question.style.userSelect = 'none';
            
            // Ajouter l'icône si elle n'existe pas
            if (!question.querySelector('i.fa-chevron-down, i.fa-chevron-up')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-chevron-down';
                icon.style.marginLeft = 'auto';
                question.appendChild(icon);
            }
        }
    });
}

// Initialiser les interactions avec la carte
function initMapInteractions() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    // Ajouter un bouton pour agrandir la carte
    const expandBtn = document.createElement('button');
    expandBtn.className = 'btn-map-expand';
    expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
    expandBtn.style.position = 'absolute';
    expandBtn.style.top = '10px';
    expandBtn.style.right = '10px';
    expandBtn.style.zIndex = '20';
    expandBtn.style.background = 'white';
    expandBtn.style.border = 'none';
    expandBtn.style.borderRadius = '5px';
    expandBtn.style.padding = '0.5rem';
    expandBtn.style.cursor = 'pointer';
    expandBtn.style.boxShadow = 'var(--shadow)';
    
    expandBtn.addEventListener('click', () => {
        const iframe = mapContainer.querySelector('iframe');
        if (iframe) {
            if (mapContainer.style.height === '600px') {
                mapContainer.style.height = '450px';
                expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
            } else {
                mapContainer.style.height = '600px';
                expandBtn.innerHTML = '<i class="fas fa-compress"></i>';
            }
        }
    });
    
    mapContainer.style.position = 'relative';
    mapContainer.appendChild(expandBtn);
}

// Fonction pour copier l'adresse
function copyAddress() {
    const address = "123 Avenue de la Libération, Kinshasa, RDC";
    
    navigator.clipboard.writeText(address).then(() => {
        showNotification('Adresse copiée !', 'L\'adresse a été copiée dans le presse-papiers', 'success');
    }).catch(() => {
        showNotification('Erreur', 'Impossible de copier l\'adresse', 'error');
    });
}

// Fonction pour ouvrir dans Google Maps
function openInMaps() {
    const address = encodeURIComponent("123 Avenue de la Libération, Kinshasa, RDC");
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
}

// Exporter les fonctions pour utilisation globale
window.copyAddress = copyAddress;
window.openInMaps = openInMaps;