document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const spans = navToggle.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });
    }

    // Buy Button Interactions
    const buyButtons = document.querySelectorAll('.buy-button');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const product = e.target.closest('.product-card');
            const productName = product.querySelector('h3').textContent;
            const productPrice = product.querySelector('.price').textContent;
            
            alert(`Added to cart: ${productName} - ${productPrice}`);
        });
    });

    // Theme Toggle Functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    if (themeToggle) {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        }

        // Toggle theme
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            themeToggle.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // Product Filtering and Sorting
    const priceSlider = document.querySelector('.price-slider');
    const priceRange = document.querySelector('.price-range');
    const categorySelect = document.querySelector('.category-select');
    const sortSelect = document.querySelector('.sort-select');
    const productsGrid = document.querySelector('.products-grid');
    const productCards = document.querySelectorAll('.product-card');
    const searchInput = document.querySelector('.search-container input, .search-input');
    const searchButton = document.querySelector('.search-container button');
    const searchSuggestions = document.querySelector('.search-suggestions');
    const recentSearches = document.querySelector('.recent-searches');

    // Price Range Filter
    if (priceSlider && priceRange) {
        priceSlider.addEventListener('input', () => {
            const maxPrice = priceSlider.value;
            priceRange.textContent = `ETB 0 - ${maxPrice}`;
            filterProducts();
        });
    }

    // Category Filter
    if (categorySelect) {
        categorySelect.addEventListener('change', filterProducts);
    }

    // Sort Products
    if (sortSelect) {
        sortSelect.addEventListener('change', filterProducts);
    }

    function filterProducts() {
        const maxPrice = priceSlider ? parseInt(priceSlider.value) : 2000;
        const category = categorySelect ? categorySelect.value : 'all';
        const sortBy = sortSelect ? sortSelect.value : 'popularity';

        // Convert NodeList to Array for sorting
        const products = Array.from(productCards);

        // Filter products
        const filteredProducts = products.filter(product => {
            const price = parseInt(product.querySelector('.price').textContent.replace(/[^0-9]/g, ''));
            const productCategory = product.getAttribute('data-category') || 'jersey';
            
            return price <= maxPrice && (category === 'all' || productCategory === category);
        });

        // Sort products
        filteredProducts.sort((a, b) => {
            const priceA = parseInt(a.querySelector('.price').textContent.replace(/[^0-9]/g, ''));
            const priceB = parseInt(b.querySelector('.price').textContent.replace(/[^0-9]/g, ''));

            switch (sortBy) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'popularity':
                default:
                    return 0; // Keep original order for popularity
            }
        });

        // Update display
        productsGrid.innerHTML = '';
        filteredProducts.forEach(product => productsGrid.appendChild(product));
    }

    // Enhanced Search Functionality
    if (searchInput) {
        // Get recent searches from localStorage
        let recentSearchList = JSON.parse(localStorage.getItem('recentSearches')) || [];

        // Update recent searches display
        function updateRecentSearches() {
            if (recentSearches) {
                recentSearches.innerHTML = recentSearchList
                    .map(term => `<span class="recent-search-item">${term}</span>`)
                    .join('');
            }
        }

        // Show search suggestions
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm.length < 2) {
                searchSuggestions.classList.remove('active');
                return;
            }

            const suggestions = Array.from(productCards)
                .filter(product => {
                    const name = product.querySelector('h3').textContent.toLowerCase();
                    const category = product.getAttribute('data-category') || '';
                    return name.includes(searchTerm) || category.includes(searchTerm);
                })
                .map(product => product.querySelector('h3').textContent)
                .slice(0, 5);

            if (suggestions.length > 0) {
                searchSuggestions.innerHTML = suggestions
                    .map(suggestion => `<div class="suggestion-item">${suggestion}</div>`)
                    .join('');
                searchSuggestions.classList.add('active');
            } else {
                searchSuggestions.classList.remove('active');
            }
        });

        // Handle suggestion clicks
        searchSuggestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                searchInput.value = e.target.textContent;
                searchSuggestions.classList.remove('active');
                performSearch(e.target.textContent);
            }
        });

        // Handle recent search clicks
        recentSearches.addEventListener('click', (e) => {
            if (e.target.classList.contains('recent-search-item')) {
                searchInput.value = e.target.textContent;
                performSearch(e.target.textContent);
            }
        });

        // Handle search button click
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    performSearch(searchTerm);
                }
            });
        }

        // Allow search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    performSearch(searchTerm);
                }
            }
        });

        // Perform search
        function performSearch(term) {
            const searchTerm = term.toLowerCase();
            const filteredProducts = Array.from(productCards).filter(product => {
                const name = product.querySelector('h3').textContent.toLowerCase();
                const category = product.getAttribute('data-category') || '';
                return name.includes(searchTerm) || category.includes(searchTerm);
            });

            productsGrid.innerHTML = '';
            filteredProducts.forEach(product => productsGrid.appendChild(product));

            // Add to recent searches
            if (!recentSearchList.includes(term)) {
                recentSearchList.unshift(term);
                recentSearchList = recentSearchList.slice(0, 5); // Keep only 5 recent searches
                localStorage.setItem('recentSearches', JSON.stringify(recentSearchList));
                updateRecentSearches();
            }
        }

        // Initial display of recent searches
        updateRecentSearches();
    }
}); 