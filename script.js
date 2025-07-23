// Car data
const cars = [
    {
        id: 1,
        name: "BMW 3 Series",
        price: "$45,000",
        category: "sedan",
        year: "2023",
        fuel: "Gasoline",
        transmission: "Automatic",
        icon: "fas fa-car",
        description: "The BMW 3 Series combines luxury with performance, featuring advanced technology and exceptional driving dynamics.",
        features: ["Leather Seats", "Navigation System", "Backup Camera", "Bluetooth", "Sunroof"],
        engine: "2.0L Turbo 4-Cylinder",
        horsepower: "255 HP",
        mpg: "26 city / 36 highway",
        color: "Alpine White"
    },
    {
        id: 2,
        name: "Audi Q5",
        price: "$52,000",
        category: "suv",
        year: "2023",
        fuel: "Diesel",
        transmission: "Automatic",
        icon: "fas fa-car-side",
        description: "The Audi Q5 offers premium comfort and versatility with quattro all-wheel drive and cutting-edge technology.",
        features: ["Quattro AWD", "Virtual Cockpit", "Premium Sound", "Heated Seats", "Power Liftgate"],
        engine: "2.0L TFSI Quattro",
        horsepower: "261 HP",
        mpg: "23 city / 28 highway",
        color: "Glacier White"
    },
    {
        id: 3,
        name: "Mercedes C-Class",
        price: "$48,000",
        category: "sedan",
        year: "2023",
        fuel: "Hybrid",
        transmission: "Automatic",
        icon: "fas fa-car",
        description: "The Mercedes C-Class delivers elegance and innovation with hybrid efficiency and luxurious appointments.",
        features: ["MBUX Infotainment", "LED Headlights", "Wireless Charging", "Premium Interior", "Safety Assist"],
        engine: "2.0L Hybrid",
        horsepower: "255 HP",
        mpg: "28 city / 37 highway",
        color: "Obsidian Black"
    },
    {
        id: 4,
        name: "Volkswagen Golf",
        price: "$24,000",
        category: "hatchback",
        year: "2023",
        fuel: "Gasoline",
        transmission: "Manual",
        icon: "fas fa-car-alt",
        description: "The Volkswagen Golf is a compact car that offers excellent fuel economy and European engineering.",
        features: ["Digital Cockpit", "App-Connect", "Rear Camera", "Automatic Climate", "Sport Seats"],
        engine: "1.4L TSI",
        horsepower: "147 HP",
        mpg: "29 city / 39 highway",
        color: "Pure White"
    },
    {
        id: 5,
        name: "Toyota RAV4",
        price: "$35,000",
        category: "suv",
        year: "2023",
        fuel: "Hybrid",
        transmission: "Automatic",
        icon: "fas fa-car-side",
        description: "The Toyota RAV4 Hybrid combines fuel efficiency with rugged capability and Toyota's renowned reliability.",
        features: ["Toyota Safety 2.0", "All-Wheel Drive", "Entune 3.0", "Wireless Charging", "Power Tailgate"],
        engine: "2.5L Hybrid",
        horsepower: "219 HP",
        mpg: "41 city / 38 highway",
        color: "Magnetic Gray"
    },
    {
        id: 6,
        name: "Ford Focus",
        price: "$22,000",
        category: "hatchback",
        year: "2023",
        fuel: "Gasoline",
        transmission: "Manual",
        icon: "fas fa-car-alt",
        description: "The Ford Focus delivers sporty handling and modern technology in an affordable and efficient package.",
        features: ["SYNC 3", "FordPass Connect", "Rear Camera", "Automatic Headlights", "Cruise Control"],
        engine: "2.0L 4-Cylinder",
        horsepower: "160 HP",
        mpg: "27 city / 38 highway",
        color: "Race Red"
    },
    {
        id: 7,
        name: "Volvo XC90",
        price: "$65,000",
        category: "suv",
        year: "2023",
        fuel: "Hybrid",
        transmission: "Automatic",
        icon: "fas fa-car-side",
        description: "The Volvo XC90 represents Scandinavian luxury with advanced safety features and elegant design.",
        features: ["Pilot Assist", "Air Suspension", "Bowers & Wilkins Audio", "Panoramic Roof", "7 Seats"],
        engine: "2.0L Supercharged Hybrid",
        horsepower: "400 HP",
        mpg: "27 city / 29 highway",
        color: "Crystal White"
    },
    {
        id: 8,
        name: "Honda Civic",
        price: "$28,000",
        category: "sedan",
        year: "2023",
        fuel: "Gasoline",
        transmission: "Automatic",
        icon: "fas fa-car",
        description: "The Honda Civic offers reliability, fuel efficiency, and modern features in a stylish and practical sedan.",
        features: ["Honda Sensing", "Apple CarPlay", "Remote Start", "Heated Seats", "Dual-Zone Climate"],
        engine: "2.0L 4-Cylinder",
        horsepower: "158 HP",
        mpg: "31 city / 40 highway",
        color: "Sonic Gray"
    }
];

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const filterButtons = document.querySelectorAll('.filter-btn');
const carsGrid = document.getElementById('carsGrid');
const ctaButton = document.querySelector('.cta-button');
const contactForm = document.getElementById('contactForm');
const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// Mobile menu toggle
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// CTA button scroll to cars section
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const carsSection = document.getElementById('cars');
        if (carsSection) {
            carsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// Create car card HTML
function createCarCard(car) {
    return `
        <div class="car-card" data-category="${car.category}">
            <div class="car-image">
                <i class="${car.icon}"></i>
            </div>
            <div class="car-info">
                <h3>${car.name}</h3>
                <div class="car-price">${car.price}</div>
                <div class="car-features">
                    <span><i class="fas fa-calendar"></i> ${car.year}</span>
                    <span><i class="fas fa-gas-pump"></i> ${car.fuel}</span>
                    <span><i class="fas fa-cogs"></i> ${car.transmission}</span>
                </div>
                <button class="car-btn" onclick="goToCarDetail(${car.id})">View Details</button>
            </div>
        </div>
    `;
}

// Load cars into grid
async function loadCars(carsToShow = null) {
    if (carsGrid) {
        let carsData = carsToShow;
        
        // If no specific cars provided, try to fetch from database
        if (!carsData) {
            try {
                const response = await fetch('/api/listings');
                if (response.ok) {
                    const dbCars = await response.json();
                    // Check if dbCars is an array
                    if (Array.isArray(dbCars)) {
                        // Convert database format to display format
                        carsData = dbCars.map(car => ({
                            id: car.id,
                            name: `${car.make} ${car.model}`,
                            price: `$${car.price.toLocaleString()}`,
                            category: getCategoryFromMake(car.make),
                            year: car.year.toString(),
                            fuel: car.fuelType,
                            transmission: car.transmission,
                            icon: getIconFromMake(car.make),
                            description: car.description,
                            features: [],
                            engine: '',
                            horsepower: '',
                            mpg: '',
                            color: ''
                        }));
                    } else {
                        // If no valid data from database, show empty
                        carsData = [];
                    }
                } else {
                    // If API fails, show empty
                    carsData = [];
                }
            } catch (error) {
                console.error('Error loading cars from database:', error);
                // If error, show empty
                carsData = [];
            }
        }
        
        carsGrid.innerHTML = carsData.map(car => createCarCard(car)).join('');
        
        // Add loading animation
        const carCards = document.querySelectorAll('.car-card');
        carCards.forEach((card, index) => {
            card.classList.add('loading');
            setTimeout(() => {
                card.classList.add('loaded');
            }, index * 100);
        });
    }
}

// Helper function to get category from make
function getCategoryFromMake(make) {
    const suvMakes = ['Audi', 'Toyota', 'Volvo'];
    const sedanMakes = ['BMW', 'Mercedes', 'Honda'];
    const hatchbackMakes = ['Volkswagen', 'Ford'];
    
    if (suvMakes.includes(make)) return 'suv';
    if (sedanMakes.includes(make)) return 'sedan';
    if (hatchbackMakes.includes(make)) return 'hatchback';
    return 'sedan'; // default
}

// Helper function to get icon from make
function getIconFromMake(make) {
    const suvMakes = ['Audi', 'Toyota', 'Volvo'];
    const hatchbackMakes = ['Volkswagen', 'Ford'];
    
    if (suvMakes.includes(make)) return 'fas fa-car-side';
    if (hatchbackMakes.includes(make)) return 'fas fa-car-alt';
    return 'fas fa-car'; // default for sedans
}

// Filter cars by category
function filterCars(category) {
    const carCards = document.querySelectorAll('.car-card');
    
    carCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Filter button event listeners
if (filterButtons) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Filter cars
            const category = button.getAttribute('data-filter');
            filterCars(category);
        });
    });
}

// Navigate to car detail page
function goToCarDetail(carId) {
    window.location.href = `car-detail.html?id=${carId}`;
}

// Toggle favorite
async function toggleFavorite(carId, button) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please login to add favorites');
        return;
    }
    
    const icon = button.querySelector('i');
    const isFavorited = icon.classList.contains('fas');
    
    try {
        if (isFavorited) {
            // Remove from favorites
            const response = await fetch(`/api/favorites/${carId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                icon.classList.remove('fas');
                icon.classList.add('far');
                button.title = 'Add to favorites';
            }
        } else {
            // Add to favorites
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ listingId: carId })
            });
            
            if (response.ok) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                button.title = 'Remove from favorites';
            } else if (response.status === 400) {
                // Already in favorites
                icon.classList.remove('far');
                icon.classList.add('fas');
                button.title = 'Remove from favorites';
            }
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Error updating favorites');
    }
}

// Show car details (modal functionality - backup)
function showCarDetails(carId) {
    const car = cars.find(c => c.id === carId);
    if (car) {
        alert(`${car.name}\n\nPrice: ${car.price}\nYear: ${car.year}\nFuel: ${car.fuel}\nTransmission: ${car.transmission}\n\nContact us for more information!`);
    }
}

// Contact form submission
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        if (name && email && message) {
            // Simulate form submission
            alert('Your message has been sent successfully! We will get back to you as soon as possible.');
            contactForm.reset();
        } else {
            alert('Please fill in all fields.');
        }
    });
}

// Scroll animations
function animateOnScroll() {
    const elements = document.querySelectorAll('.loading');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('loaded');
        }
    });
}

// Header background change on scroll
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(30, 60, 114, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'linear-gradient(135deg, #1e3c72, #2a5298)';
        header.style.backdropFilter = 'none';
    }
}

// Event listeners for scroll effects
window.addEventListener('scroll', () => {
    animateOnScroll();
    handleHeaderScroll();
});

// User Authentication Functions
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        const user = JSON.parse(userData);
        showUserMenu(user);
    } else {
        showAuthButtons();
    }
}

function showUserMenu(user) {
    authButtons.style.display = 'none';
    userMenu.style.display = 'flex';
    userName.textContent = user.username || user.fullName || 'User';
}

function showAuthButtons() {
    authButtons.style.display = 'flex';
    userMenu.style.display = 'none';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    showAuthButtons();
    
    // Optional: Call logout API
    fetch('/api/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    }).catch(err => console.log('Logout API call failed:', err));
}

// User menu toggle
if (userMenu) {
    const userInfo = userMenu.querySelector('.user-info');
    if (userInfo) {
        userInfo.addEventListener('click', () => {
            userMenu.classList.toggle('active');
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });
    
    userMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCars();
    checkAuthStatus();
    
    // Add loading animations to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('loading');
    });
    
    // Trigger initial scroll animation
    setTimeout(() => {
        animateOnScroll();
    }, 100);
});

// Search functionality (bonus feature)
function searchCars(searchTerm) {
    const filteredCars = cars.filter(car => 
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    loadCars(filteredCars);
}

// Export cars data for use in detail page
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cars };
}

// Add search input if needed
function addSearchFeature() {
    const searchHTML = `
        <div class="search-container" style="text-align: center; margin-bottom: 2rem;">
            <input type="text" id="searchInput" placeholder="Search cars..." 
                   style="padding: 12px 20px; border: 2px solid #2a5298; border-radius: 25px; 
                          width: 300px; max-width: 100%; font-size: 1rem;">
        </div>
    `;
    
    const filterButtons = document.querySelector('.filter-buttons');
    filterButtons.insertAdjacentHTML('beforebegin', searchHTML);
    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        if (searchTerm.length === 0) {
            loadCars();
            // Reset filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
        } else if (searchTerm.length >= 2) {
            searchCars(searchTerm);
        }
    });
}

// Uncomment the line below to add search feature
// addSearchFeature();

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll handler
const debouncedScrollHandler = debounce(() => {
    animateOnScroll();
    handleHeaderScroll();
}, 10);

window.removeEventListener('scroll', () => {
    animateOnScroll();
    handleHeaderScroll();
});

window.addEventListener('scroll', debouncedScrollHandler);

// Add some interactive features
function addInteractiveFeatures() {
    // Add hover effects to car cards
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.car-card')) {
            e.target.closest('.car-card').style.transform = 'translateY(-10px) scale(1.02)';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.car-card')) {
            e.target.closest('.car-card').style.transform = 'translateY(0) scale(1)';
        }
    });
}

// Initialize interactive features
addInteractiveFeatures();

// Console welcome message
console.log('%c🚗 AutoMax Car Site Loaded Successfully! 🚗', 
    'color: #2a5298; font-size: 16px; font-weight: bold;');
console.log('Developed with ❤️ using HTML, CSS & JavaScript');