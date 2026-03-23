// ===== SCRIPT POUR LA PAGE GALERIE =====

// Base de données des images
const galleryImages = [
    {
        id: 1,
        src: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'Poulet à la Moambé',
        category: 'plats',
        description: 'Notre plat signature préparé avec soin'
    },
    {
        id: 2,
        src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGZvb2R8ZW58MHx8MHx8fDA%3D',
        title: 'Fumbwa aux crevettes',
        category: 'plats',
        description: 'Feuilles de fumbwa préparées traditionnellement'
    },

    {
        id: 4,
        src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'Liboke de poisson',
        category: 'plats',
        description: 'Poisson cuit dans des feuilles de bananier'
    },
    {
        id: 5,
        src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'Brochettes de bœuf',
        category: 'grillades',
        description: 'Brochettes grillées au charbon de bois'
    },
    {
        id: 6,
        src: 'https://images.unsplash.com/photo-1600699899970-b1c9fadd8f9e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29va2VkJTIwZmlzaHxlbnwwfHwwfHx8MA%3D%3D',
        title: 'Poisson braisé',
        category: 'grillades',
        description: 'Poisson capitaine braisé, spécialité de la maison'
    },
    {
        id: 7,
        src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'Notre restaurant',
        category: 'restaurant',
        description: 'Ambiance chaleureuse et accueillante'
    },
    {
        id: 8,
        src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'Salle principale',
        category: 'restaurant',
        description: 'Espace climatisé pour votre confort'
    },
    {
        id: 9,
        src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'Préparation des plats',
        category: 'restaurant',
        description: 'Notre équipe en cuisine'
    },
    {
        id: 10,
        src: 'https://images.unsplash.com/photo-1616757957712-6c8874a8c82b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVsaXZlcnklMjBzZXJ2aWNlfGVufDB8fDB8fHww',
        title: 'Service de livraison',
        category: 'evenements',
        description: 'Livraison rapide dans tout Kinshasa'
    },
    {
        id: 11,
        src: 'https://images.unsplash.com/photo-1765741586754-81e3f9823e72?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHNwZWNpYWwlMjBldmVudHxlbnwwfHwwfHx8MA%3D%3D',
        title: 'Événement spécial',
        category: 'evenements',
        description: 'Soirée musicale au restaurant'
    },
    {
        id: 12,
        src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'Anniversaire',
        category: 'evenements',
        description: 'Célébrez vos événements chez nous'
    },
    {
        id: 13,
        src: 'https://media.istockphoto.com/id/2215930957/photo/happy-group-of-employees-smiling-at-a-restaurant.webp?a=1&b=1&s=612x612&w=0&k=20&c=p6yWS4335Du7cAPGZ7v_v6AUxjJmqkkuXV89AkFkUdU=+',
        title: 'Équipe OMMY-FOOD',
        category: 'restaurant',
        description: 'Notre personnel dévoué'
    }
];

let currentFilter = 'all';
let currentImageIndex = 0;
let filteredImages = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    displayGallery('all');
    setupLightboxKeyboard();
});

// Afficher la galerie
function displayGallery(filter = 'all') {
    const galleryGrid = document.getElementById('gallery-grid');
    
    filteredImages = filter === 'all' 
        ? galleryImages 
        : galleryImages.filter(img => img.category === filter);
    
    let html = '';
    filteredImages.forEach(img => {
        html += `
            <div class="gallery-item" onclick="openLightbox(${img.id})">
                <img src="${img.src}" alt="${img.title}" loading="lazy">
                <div class="gallery-overlay">
                    <h3>${img.title}</h3>
                    <p>${img.description}</p>
                </div>
            </div>
        `;
    });
    
    galleryGrid.innerHTML = html;
}

// Filtrer la galerie
function filterGallery(category) {
    currentFilter = category;
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayGallery(category);
}

// Lightbox functions
function openLightbox(imageId) {
    const image = galleryImages.find(img => img.id === imageId);
    if (!image) return;
    
    currentImageIndex = galleryImages.findIndex(img => img.id === imageId);
    
    document.getElementById('lightbox-img').src = image.src;
    document.getElementById('lightbox-caption').textContent = image.title;
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function changeImage(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    } else if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    }
    
    const image = galleryImages[currentImageIndex];
    document.getElementById('lightbox-img').src = image.src;
    document.getElementById('lightbox-caption').textContent = image.title;
}

function setupLightboxKeyboard() {
    document.addEventListener('keydown', function(e) {
        if (!document.getElementById('lightbox').classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            changeImage(-1);
        } else if (e.key === 'ArrowRight') {
            changeImage(1);
        }
    });
}