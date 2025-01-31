class AnimePlatform {
    constructor() {
        this.init();
    }

    init() {
        this.cacheDOM();
        this.initPlayer();
        this.setupEventListeners();
        this.loadInitialData();
        this.setupTheme();
        this.checkAuth();
    }

    cacheDOM() {
        this.elements = {
            animeGrid: document.getElementById('anime-grid'),
            searchInput: document.querySelector('.neon-input'),
            playerOverlay: document.getElementById('player-overlay'),
            authModal: document.getElementById('auth-modal'),
            // Cache other elements...
        };
    }

    initPlayer() {
        this.player = new Plyr('#main-player', {
            quality: { 
                default: '4k', 
                options: ['4k', '1080', '720'],
                forced: true
            },
            keyboard: { global: true },
            controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
            settings: ['quality', 'speed']
        });
    }

    async loadInitialData() {
        try {
            this.showLoader();
            const [trending, popular] = await Promise.all([
                this.fetchAPI('/trending'),
                this.fetchAPI('/popular')
            ]);
            this.renderAnimeGrid(trending);
            this.updateHeroSection(popular[0]);
        } catch (error) {
            this.showError('Failed to load content');
        } finally {
            this.hideLoader();
        }
    }

    async fetchAPI(endpoint) {
        const response = await fetch(`https://api.jikan.moe/v4${endpoint}`);
        if (!response.ok) throw new Error('API Error');
        return response.json();
    }

    renderAnimeGrid(animeList) {
        const fragment = document.createDocumentFragment();
        
        animeList.data.forEach(anime => {
            const card = this.createAnimeCard(anime);
            fragment.appendChild(card);
        });

        this.elements.animeGrid.innerHTML = '';
        this.elements.animeGrid.appendChild(fragment);
    }

    createAnimeCard(anime) {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <div class="card-media">
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                <div class="hover-overlay">
                    <button class="quick-play"><i class="fas fa-play"></i></button>
                    <div class="meta-info">
                        <span class="score">⭐ ${anime.score || 'N/A'}</span>
                        <span class="episodes">${anime.episodes} EP</span>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <h4>${anime.title}</h4>
                <div class="genre-tags">
                    ${anime.genres.map(g => `<span>${g.name}</span>`).join('')}
                </div>
            </div>
        `;
        return card;
    }

    setupEventListeners() {
        // Anime Card Interactions
        this.elements.animeGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.anime-card');
            if (card) this.handleCardClick(card);
        });

        // Search Functionality
        this.elements.searchInput.addEventListener('input', 
            this.debounce(this.handleSearch.bind(this), 300));

        // Player Controls
        document.querySelector('.close-player').addEventListener('click', () => {
            this.hidePlayer();
        });
    }

    handleCardClick(card) {
        const animeId = card.dataset.id;
        this.loadAnimeDetails(animeId);
        this.showPlayer();
    }

    showPlayer() {
        this.elements.playerOverlay.style.display = 'grid';
        document.body.style.overflow = 'hidden';
    }

    hidePlayer() {
        this.elements.playerOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.player.stop();
    }

    // Add 50+ more methods for full functionality...
}

// Initialize Platform
const platform = new AnimePlatform();