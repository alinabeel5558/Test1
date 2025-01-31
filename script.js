class AnimePlatform {
    constructor() {
        this.player = null;
        this.currentAnime = null;
        this.watchList = JSON.parse(localStorage.getItem('watchlist')) || [];
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.init();
    }

    init() {
        this.initPlayer();
        this.setupEventListeners();
        this.loadInitialData();
        this.setupRouter();
        this.updateAuthUI();
    }

    initPlayer() {
        this.player = new Plyr('#main-player', {
            quality: {
                default: 1080,
                options: [1080, 720, 480],
                forced: true
            },
            keyboard: { global: true },
            controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
        });
    }

    async loadInitialData() {
        try {
            this.showLoader();
            const [topAnime, genres] = await Promise.all([
                this.fetchAPI('/top/anime'),
                this.fetchAPI('/genres/anime')
            ]);
            this.renderAnimeGrid(topAnime.data);
            this.renderGenreFilter(genres.data);
        } catch (error) {
            this.showError('Failed to load initial data');
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
        const grid = document.createElement('div');
        grid.className = 'anime-grid';

        grid.innerHTML = animeList.map(anime => `
            <div class="anime-card" data-id="${anime.mal_id}">
                <img src="${anime.images.jpg.large_image_url}" class="anime-thumbnail" alt="${anime.title}">
                <div class="anime-info">
                    <h3>${anime.title}</h3>
                    <div class="meta">
                        <span>⭐ ${anime.score || 'N/A'}</span>
                        <span>${anime.episodes || '?'} Episodes</span>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('main-content').appendChild(grid);
    }

    showVideoPlayer(anime) {
        this.currentAnime = anime;
        document.getElementById('player-overlay').style.display = 'grid';
        this.loadVideoStream();
    }

    loadVideoStream() {
        const sources = {
            1080: 'https://example.com/streams/1080.m3u8',
            720: 'https://example.com/streams/720.m3u8',
            480: 'https://example.com/streams/480.m3u8'
        };

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(sources[this.player.currentQuality]);
            hls.attachMedia(this.player.media);
        } else {
            this.player.source = {
                type: 'video',
                sources: [{
                    src: sources[this.player.currentQuality],
                    type: 'application/x-mpegURL'
                }]
            };
        }
    }

    setupEventListeners() {
        // Anime Card Clicks
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.anime-card');
            if (card) this.showAnimeDetails(card.dataset.id);
        });

        // Video Player Close
        document.getElementById('player-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('player-overlay')) {
                document.getElementById('player-overlay').style.display = 'none';
                this.player.stop();
            }
        });

        // Quality Selection
        document.querySelectorAll('.quality-selector button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.player.currentQuality = btn.dataset.quality;
                this.loadVideoStream();
            });
        });
    }

    setupRouter() {
        window.addEventListener('hashchange', () => {
            const route = window.location.hash.substring(1);
            this.handleRoute(route);
        });
        this.handleRoute(window.location.hash.substring(1));
    }

    handleRoute(route) {
        // Add routing logic for different pages
    }

    showLoader() {
        // Implement loading animation
    }

    showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        document.body.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 3000);
    }
}

// Initialize Platform
const platform = new AnimePlatform();