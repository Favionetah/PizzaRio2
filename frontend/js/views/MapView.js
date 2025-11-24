export default {
    template: `
        <div class="map-view-container">
            <div class="sidebar-branches">
                <div class="sidebar-header">
                    <h2>Nuestras Sucursales</h2>
                    <div class="search-box">
                        <input type="text" v-model="searchQuery" placeholder="Buscar sucursal...">
                    </div>
                    <div class="filter-cities">
                        <button :class="{ active: cityFilter === 'All' }" @click="cityFilter = 'All'">Todas</button>
                        <button :class="{ active: cityFilter === 'La Paz' }" @click="cityFilter = 'La Paz'">La Paz</button>
                        <button :class="{ active: cityFilter === 'Santa Cruz' }" @click="cityFilter = 'Santa Cruz'">Santa Cruz</button>
                    </div>
                </div>
                
                <div class="branches-list">
                    <div v-if="loading" class="loading-branches">Cargando sucursales...</div>
                    <div v-else-if="filteredBranches.length === 0" class="no-branches">No se encontraron sucursales.</div>
                    
                    <div v-for="branch in filteredBranches" :key="branch.idSucursal" 
                         class="branch-item" 
                         :class="{ selected: selectedBranch && selectedBranch.idSucursal === branch.idSucursal }"
                         @click="selectBranch(branch)">
                        <h3>{{ branch.nombreSucursal }}</h3>
                        <p class="branch-address">{{ branch.direccion }}</p>
                        <p class="branch-city">{{ branch.ciudad }}</p>
                        <div class="branch-actions">
                            <button class="btn-directions" @click.stop="openDirections(branch)">Cómo llegar 📍</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="map-container" id="google-map"></div>
        </div>
    `,
    data() {
        return {
            branches: [],
            loading: true,
            searchQuery: '',
            cityFilter: 'All',
            map: null,
            markers: [],
            selectedBranch: null,
            infoWindow: null
        }
    },
    computed: {
        filteredBranches() {
            return this.branches.filter(branch => {
                const matchesCity = this.cityFilter === 'All' || branch.ciudad === this.cityFilter;
                const matchesSearch = branch.nombreSucursal.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    branch.direccion.toLowerCase().includes(this.searchQuery.toLowerCase());
                return matchesCity && matchesSearch;
            });
        }
    },
    async mounted() {
        await this.fetchBranches();
        this.initMap();
    },
    watch: {
        filteredBranches() {
            this.updateMarkers();
        }
    },
    methods: {
        async fetchBranches() {
            try {
                const res = await fetch('http://localhost:3000/api/map/sucursales');
                this.branches = await res.json();
                this.loading = false;
            } catch (error) {
                console.error('Error loading branches:', error);
                this.loading = false;
            }
        },
        initMap() {
            // Default center (Bolivia)
            const boliviaCenter = { lat: -16.2902, lng: -63.5887 };

            if (typeof google === 'undefined') {
                console.error('Google Maps API not loaded');
                return;
            }

            this.map = new google.maps.Map(document.getElementById("google-map"), {
                zoom: 6,
                center: boliviaCenter,
                styles: [
                    {
                        "featureType": "poi",
                        "stylers": [{ "visibility": "off" }]
                    }
                ]
            });

            this.infoWindow = new google.maps.InfoWindow();
            this.updateMarkers();
        },
        updateMarkers() {
            if (!this.map) return;

            // Clear existing markers
            this.markers.forEach(marker => marker.setMap(null));
            this.markers = [];

            const bounds = new google.maps.LatLngBounds();

            this.filteredBranches.forEach(branch => {
                const position = { lat: parseFloat(branch.latitud), lng: parseFloat(branch.longitud) };

                const marker = new google.maps.Marker({
                    position: position,
                    map: this.map,
                    title: branch.nombreSucursal,
                    animation: google.maps.Animation.DROP
                });

                marker.addListener("click", () => {
                    this.selectBranch(branch);
                    this.infoWindow.setContent(`
                        <div style="padding: 10px; max-width: 200px;">
                            <h3 style="color: #E03616; margin: 0 0 5px 0;">${branch.nombreSucursal}</h3>
                            <p style="margin: 0 0 5px 0;">${branch.direccion}</p>
                            <p style="font-weight: bold;">${branch.telefono}</p>
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}" target="_blank" style="color: #E03616; text-decoration: underline;">Ver en Google Maps</a>
                        </div>
                    `);
                    this.infoWindow.open(this.map, marker);
                });

                this.markers.push(marker);
                bounds.extend(position);
            });

            if (this.filteredBranches.length > 0) {
                this.map.fitBounds(bounds);
                // Prevent zooming in too much if only one marker
                const listener = google.maps.event.addListener(this.map, "idle", () => {
                    if (this.map.getZoom() > 15) this.map.setZoom(15);
                    google.maps.event.removeListener(listener);
                });
            }
        },
        selectBranch(branch) {
            this.selectedBranch = branch;
            const position = { lat: parseFloat(branch.latitud), lng: parseFloat(branch.longitud) };
            this.map.panTo(position);
            this.map.setZoom(16);

            // Find marker and trigger click to open info window
            const marker = this.markers.find(m =>
                m.getPosition().lat().toFixed(4) === position.lat.toFixed(4) &&
                m.getPosition().lng().toFixed(4) === position.lng.toFixed(4)
            );
            if (marker) {
                google.maps.event.trigger(marker, 'click');
            }
        },
        openDirections(branch) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${branch.latitud},${branch.longitud}`, '_blank');   
        }
    }
}
