// =====================================================
// POLYBIUS VIDEOGAMES - SERVICIO TÉCNICO
// Lógica principal de la aplicación
// =====================================================

class ReparacionesApp {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentFilter = 'todos';
        this.searchTerm = '';
        this.sortColumn = CONFIG.COLUMNAS.ORDEN;
        this.sortDirection = 'desc';
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadData();
    }

    bindEvents() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.currentPage = 1;
                this.applyFilters();
            });
        });

        // Add repair button
        const addBtn = document.getElementById('addRepairBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Modal close
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el || el.classList.contains('modal-close')) {
                    this.closeModal();
                }
            });
        });

        // Form submit
        const form = document.getElementById('repairForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRepair();
            });
        }

        // Client search
        const clientSearch = document.getElementById('clientSearch');
        if (clientSearch) {
            clientSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchClientRepair();
                }
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }
    }

    async loadData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);

        try {
            const url = this.buildApiUrl();
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error al cargar los datos');
            }

            const text = await response.text();
            this.data = this.parseCSV(text);
            this.applyFilters();
            
            if (document.getElementById('stats')) {
                this.updateStats();
            }
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Error al cargar los datos. Verificá la configuración.', 'error');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    buildApiUrl() {
        const base = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/export?format=csv`;
        const gid = CONFIG.SHEET_GID > 0 ? `&gid=${CONFIG.SHEET_GID}` : '';
        const api = CONFIG.API_KEY ? `&key=${CONFIG.API_KEY}` : '';
        return `${base}${gid}${api}`;
    }

    parseCSV(text) {
        const lines = text.split('\n');
        const data = [];

        // Skip header rows (first 3 rows are title/subtitle/phone)
        for (let i = 3; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = this.parseCSVLine(line);
            
            // Skip separator rows
            if (values[0] && values[0].includes('...')) continue;
            if (values[0] && values[0].includes('Fecha:') && values[1] && values[1].includes('Nº de orden')) continue;

            const repair = this.mapToRepair(values);
            if (repair && repair.orden) {
                data.push(repair);
            }
        }

        return data;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    mapToRepair(values) {
        const col = CONFIG.COLUMNAS;
        
        // Clean up values (remove labels like "Fecha:", "Nombre :", etc.)
        const cleanValue = (val, prefix) => {
            if (!val) return '';
            return val.replace(prefix, '').trim();
        };

        return {
            fecha: cleanValue(values[col.FECHA], 'Fecha:'),
            orden: cleanValue(values[col.ORDEN], 'Nº de orden :').replace('Nº de orden :', ''),
            cliente: cleanValue(values[col.CLIENTE], 'Nombre :'),
            telefono: cleanValue(values[col.TELEFONO], 'Teléfono :'),
            consola: cleanValue(values[col.CONSOLA], 'Consola :'),
            serie: cleanValue(values[col.SERIE], 'N.º de Serie :'),
            falla: cleanValue(values[col.FALLA], 'Falla acusada:'),
            reparacion: cleanValue(values[col.REPARACION], 'Costo Reparacion:'),
            estado: cleanValue(values[col.ESTADO], '') || 'Recibido',
            precio: cleanValue(values[col.PRECIO], 'Costo de Reparación :'),
            confirmado: cleanValue(values[col.CONFIRMADO], ''),
            listoRetirar: cleanValue(values[col.LISTO_RETIRAR], ''),
            observaciones: cleanValue(values[col.OBSERVACIONES], 'Obs.,'),
            rawValues: values
        };
    }

    applyFilters() {
        let filtered = [...this.data];

        // Apply status filter
        if (this.currentFilter !== 'todos') {
            filtered = filtered.filter(r => {
                const estado = r.estado.toLowerCase();
                switch (this.currentFilter) {
                    case 'recibidos': return estado === 'recibido';
                    case 'presupuesto': return estado === 'en presupuesto';
                    case 'reparacion': return estado === 'en reparación';
                    case 'listos': return estado === 'listo para retirar';
                    case 'entregados': return estado === 'entregado';
                    case 'cancelados': return estado === 'cancelado';
                    default: return true;
                }
            });
        }

        // Apply search
        if (this.searchTerm) {
            filtered = filtered.filter(r => {
                const searchFields = [
                    r.orden,
                    r.cliente,
                    r.telefono,
                    r.consola,
                    r.serie,
                    r.falla,
                    r.estado
                ].join(' ').toLowerCase();
                
                return searchFields.includes(this.searchTerm);
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aVal = a.orden || '';
            const bVal = b.orden || '';
            
            if (this.sortDirection === 'asc') {
                return aVal.localeCompare(bVal, undefined, { numeric: true });
            } else {
                return bVal.localeCompare(aVal, undefined, { numeric: true });
            }
        });

        this.filteredData = filtered;
        this.renderTable();
        this.renderPagination();
    }

    renderTable() {
        const tbody = document.getElementById('repairTableBody');
        if (!tbody) return;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <div class="icon">🔍</div>
                            <h3>No se encontraron reparaciones</h3>
                            <p>Intentá con otros términos de búsqueda</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageData = this.filteredData.slice(start, end);

        tbody.innerHTML = pageData.map(repair => `
            <tr data-orden="${repair.orden}">
                <td><strong>${repair.orden || '—'}</strong></td>
                <td>${repair.fecha || '—'}</td>
                <td>
                    <div>${repair.cliente || '—'}</div>
                    ${repair.telefono ? `<small style="color: var(--text-secondary)">${repair.telefono}</small>` : ''}
                </td>
                <td>${repair.consola || '—'}</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(repair.estado)}">
                        <span class="status-dot"></span>
                        ${repair.estado}
                    </span>
                </td>
                <td>${repair.precio ? `$${repair.precio}` : '—'}</td>
                <td>
                    <span class="confirm-badge ${repair.confirmado.toLowerCase() === 'si' ? 'si' : 'no'}">
                        ${repair.confirmado || 'No'}
                    </span>
                </td>
                <td>
                    <div class="quick-actions">
                        <button class="action-btn edit" onclick="app.editRepair('${repair.orden}')" data-tooltip="Editar">✏️</button>
                        <button class="action-btn" onclick="app.viewRepair('${repair.orden}')" data-tooltip="Ver detalle">👁️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = `
            <button class="pagination-btn" onclick="app.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                ← Anterior
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="app.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += `<span style="color: var(--text-secondary)">...</span>`;
            }
        }

        html += `
            <button class="pagination-btn" onclick="app.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>
                Siguiente →
            </button>
        `;

        pagination.innerHTML = html;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderTable();
        this.renderPagination();
    }

    getStatusClass(status) {
        const statusMap = {
            'recibido': 'recibido',
            'en presupuesto': 'presupuesto',
            'esperando repuesto': 'repuesto',
            'en reparación': 'reparacion',
            'listo para retirar': 'listo',
            'entregado': 'entregado',
            'cancelado': 'cancelado'
        };
        return statusMap[status.toLowerCase()] || 'recibido';
    }

    updateStats() {
        const stats = {
            total: this.data.length,
            recibidos: this.data.filter(r => r.estado.toLowerCase() === 'recibido').length,
            enProceso: this.data.filter(r => ['en presupuesto', 'en reparación', 'esperando repuesto'].includes(r.estado.toLowerCase())).length,
            listos: this.data.filter(r => r.estado.toLowerCase() === 'listo para retirar').length,
            entregados: this.data.filter(r => r.estado.toLowerCase() === 'entregado').length,
            cancelados: this.data.filter(r => r.estado.toLowerCase() === 'cancelado').length
        };

        const statsEl = document.getElementById('stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon blue">📋</div>
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Reparaciones</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon yellow">📥</div>
                    <div class="stat-value">${stats.recibidos}</div>
                    <div class="stat-label">Recibidos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">⚙️</div>
                    <div class="stat-value">${stats.enProceso}</div>
                    <div class="stat-label">En Proceso</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">✅</div>
                    <div class="stat-value">${stats.listos}</div>
                    <div class="stat-label">Listos para Retirar</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">📦</div>
                    <div class="stat-value">${stats.entregados}</div>
                    <div class="stat-label">Entregados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red">❌</div>
                    <div class="stat-value">${stats.cancelados}</div>
                    <div class="stat-label">Cancelados</div>
                </div>
            `;
        }

        // Update filter counts
        document.querySelectorAll('.filter-tab .count').forEach(el => {
            const filter = el.closest('.filter-tab').dataset.filter;
            const count = this.getFilterCount(filter);
            el.textContent = count;
        });
    }

    getFilterCount(filter) {
        switch (filter) {
            case 'todos': return this.data.length;
            case 'recibidos': return this.data.filter(r => r.estado.toLowerCase() === 'recibido').length;
            case 'presupuesto': return this.data.filter(r => r.estado.toLowerCase() === 'en presupuesto').length;
            case 'reparacion': return this.data.filter(r => r.estado.toLowerCase() === 'en reparación').length;
            case 'listos': return this.data.filter(r => r.estado.toLowerCase() === 'listo para retirar').length;
            case 'entregados': return this.data.filter(r => r.estado.toLowerCase() === 'entregado').length;
            case 'cancelados': return this.data.filter(r => r.estado.toLowerCase() === 'cancelado').length;
            default: return 0;
        }
    }

    // Client Portal Methods
    searchClientRepair() {
        const input = document.getElementById('clientSearch');
        const orderId = input.value.trim();
        
        if (!orderId) {
            this.showMessage('Por favor ingresá tu número de orden', 'error');
            return;
        }

        const result = this.data.find(r => r.orden === orderId);
        const resultDiv = document.getElementById('repairResult');
        const errorDiv = document.getElementById('searchError');

        if (result) {
            errorDiv.classList.remove('show');
            this.renderClientResult(result);
            resultDiv.classList.add('show');
        } else {
            resultDiv.classList.remove('show');
            this.showMessage('No se encontró ninguna reparación con ese número', 'error');
        }
    }

    renderClientResult(repair) {
        const resultDiv = document.getElementById('repairResult');
        
        const estadoClass = this.getStatusClass(repair.estado);
        const confirmadoClass = repair.confirmado.toLowerCase() === 'si' ? 'si' : 'no';
        
        resultDiv.innerHTML = `
            <div class="repair-header">
                <div>
                    <div class="repair-order">Orden Nº ${repair.orden}</div>
                    <div style="color: var(--text-secondary)">Fecha de ingreso: ${repair.fecha || 'No especificada'}</div>
                </div>
                <span class="status-badge ${estadoClass}">
                    <span class="status-dot"></span>
                    ${repair.estado}
                </span>
            </div>
            
            <div class="repair-grid">
                <div class="repair-field">
                    <label>Cliente</label>
                    <div class="value">${repair.cliente || 'No especificado'}</div>
                </div>
                <div class="repair-field">
                    <label>Consola / Dispositivo</label>
                    <div class="value">${repair.consola || 'No especificado'}</div>
                </div>
                <div class="repair-field">
                    <label>Falla Reportada</label>
                    <div class="value">${repair.falla || 'No especificada'}</div>
                </div>
                <div class="repair-field">
                    <label>Tipo de Reparación</label>
                    <div class="value">${repair.reparacion || 'En revisión'}</div>
                </div>
                <div class="repair-field">
                    <label>Costo de Reparación</label>
                    <div class="value price">${repair.precio ? `$${repair.precio}` : 'Pendiente'}</div>
                </div>
                <div class="repair-field">
                    <label>Confirmado</label>
                    <div class="value">
                        <span class="confirm-badge ${confirmadoClass}">
                            ${repair.confirmado || 'No'}
                        </span>
                    </div>
                </div>
                <div class="repair-field">
                    <label>Listo para Retirar</label>
                    <div class="value">
                        ${repair.listoRetirar.toLowerCase() === 'si' ? 
                            '<span class="status-badge listo"><span class="status-dot"></span>SÍ - Retirá cuando quieras</span>' : 
                            '<span style="color: var(--text-secondary)">Aún no está listo</span>'}
                    </div>
                </div>
                <div class="repair-field">
                    <label>Observaciones</label>
                    <div class="value">${repair.observaciones || 'Sin observaciones'}</div>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-dark); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <p style="color: var(--text-secondary); font-size: 0.875rem;">
                    <strong>📞 ¿Tenés preguntas?</strong> Contactanos al ${CONFIG.TELEFONO} (solo WhatsApp)
                </p>
            </div>
        `;
    }

    // Modal Methods
    openModal(repair = null) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('repairForm');

        if (repair) {
            title.textContent = 'Editar Reparación';
            this.fillForm(repair);
        } else {
            title.textContent = 'Nueva Reparación';
            form.reset();
        }

        modal.classList.add('show');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('show');
    }

    fillForm(repair) {
        document.getElementById('editOrden').value = repair.orden || '';
        document.getElementById('editCliente').value = repair.cliente || '';
        document.getElementById('editTelefono').value = repair.telefono || '';
        document.getElementById('editConsola').value = repair.consola || '';
        document.getElementById('editSerie').value = repair.serie || '';
        document.getElementById('editFalla').value = repair.falla || '';
        document.getElementById('editReparacion').value = repair.reparacion || '';
        document.getElementById('editEstado').value = repair.estado || 'Recibido';
        document.getElementById('editPrecio').value = repair.precio || '';
        document.getElementById('editConfirmado').value = repair.confirmado || 'No';
        document.getElementById('editListo').value = repair.listoRetirar || 'No';
        document.getElementById('editObservaciones').value = repair.observaciones || '';
    }

    editRepair(orden) {
        const repair = this.data.find(r => r.orden === orden);
        if (repair) {
            this.openModal(repair);
        }
    }

    viewRepair(orden) {
        const repair = this.data.find(r => r.orden === orden);
        if (repair) {
            // Open in client view mode
            window.open(`index.html?orden=${orden}`, '_blank');
        }
    }

    async saveRepair() {
        // Note: This requires Google Sheets API with write access
        // For simplicity, this is a placeholder that shows the concept
        // In production, you'd need to set up OAuth2 or a backend proxy
        
        const formData = {
            orden: document.getElementById('editOrden').value,
            cliente: document.getElementById('editCliente').value,
            telefono: document.getElementById('editTelefono').value,
            consola: document.getElementById('editConsola').value,
            serie: document.getElementById('editSerie').value,
            falla: document.getElementById('editFalla').value,
            reparacion: document.getElementById('editReparacion').value,
            estado: document.getElementById('editEstado').value,
            precio: document.getElementById('editPrecio').value,
            confirmado: document.getElementById('editConfirmado').value,
            listoRetirar: document.getElementById('editListo').value,
            observaciones: document.getElementById('editObservaciones').value
        };

        // For now, show a message that editing requires API setup
        this.showMessage('Para guardar cambios, necesitás configurar la API de Google Sheets con permisos de escritura. Consultá el README para más instrucciones.', 'info');
        this.closeModal();
    }

    exportToCSV() {
        const headers = ['Orden', 'Fecha', 'Cliente', 'Teléfono', 'Consola', 'Serie', 'Falla', 'Reparación', 'Estado', 'Precio', 'Confirmado', 'Listo Retirar', 'Observaciones'];
        
        const rows = this.filteredData.map(r => [
            r.orden,
            r.fecha,
            r.cliente,
            r.telefono,
            r.consola,
            r.serie,
            r.falla,
            r.reparacion,
            r.estado,
            r.precio,
            r.confirmado,
            r.listoRetirar,
            r.observaciones
        ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','));

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reparaciones_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    showLoading(show) {
        const loader = document.getElementById('loading');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }

    showMessage(text, type = 'info') {
        const existing = document.querySelector('.message.show');
        if (existing) existing.classList.remove('show');

        // Create or find message container
        let msgDiv = document.getElementById('appMessage');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.id = 'appMessage';
            msgDiv.className = `message ${type}`;
            
            const container = document.querySelector('.container') || document.body;
            container.insertBefore(msgDiv, container.firstChild);
        }

        msgDiv.className = `message ${type} show`;
        msgDiv.innerHTML = `<span>${text}</span>`;
        
        setTimeout(() => {
            msgDiv.classList.remove('show');
        }, 5000);
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ReparacionesApp();
    
    // Check for order parameter in URL
    const params = new URLSearchParams(window.location.search);
    const orden = params.get('orden');
    if (orden) {
        const input = document.getElementById('clientSearch');
        if (input) {
            input.value = orden;
            setTimeout(() => app.searchClientRepair(), 500);
        }
    }
});
