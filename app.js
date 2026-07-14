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
        this.sortDirection = 'desc';
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadData();
    }

    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.currentPage = 1;
                this.applyFilters();
            });
        });

        const addBtn = document.getElementById('addRepairBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        document.querySelectorAll('.modal-close').forEach(el => {
            el.addEventListener('click', () => this.closeModal());
        });

        document.querySelectorAll('.modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el) this.closeModal();
            });
        });

        const form = document.getElementById('repairForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRepair();
            });
        }

        const clientSearch = document.getElementById('clientSearch');
        if (clientSearch) {
            clientSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchClientRepair();
            });
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }

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
            if (!response.ok) throw new Error('Error al cargar los datos');
            const text = await response.text();
            this.data = this.parseCSV(text);
            this.applyFilters();
            if (document.getElementById('stats')) this.updateStats();
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Error al cargar los datos. Verificá que la hoja esté compartida como pública.', 'error');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    buildApiUrl() {
        const base = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/export?format=csv`;
        const gid = CONFIG.SHEET_GID ? `&gid=${CONFIG.SHEET_GID}` : '';
        return `${base}${gid}`;
    }

    parseCSV(text) {
        const lines = text.split('\n');
        const data = [];
        const col = CONFIG.COLUMNAS;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith(',,,')) continue;

            const values = this.parseCSVLine(line);
            if (values.length < 6) continue;

            const orden = (values[col.ORDEN] || '').trim();
            if (!orden || isNaN(orden)) continue;

            const fecha = (values[col.FECHA] || '').trim();
            const telefono = (values[col.TELEFONO] || '').trim();
            const consola = (values[col.CONSOLA] || '').trim();
            const serie = (values[col.SERIE] || '').trim();
            const falla = (values[col.FALLA] || '').trim();
            const observaciones = (values[col.OBSERVACIONES] || '').trim();
            const tecnico = (values[col.TECNICO] || '').trim();
            const reparacion = (values[col.REPARACION] || '').trim();
            const costoTecnico = (values[col.COSTO_TECNICO] || '').trim();
            const confirma = (values[col.CONFIRMA] || '').trim();
            const precio = (values[col.PRECIO] || '').trim();
            const entrega = (values[col.ENTREGA] || '').trim();
            const fechaRetiro = (values[col.FECHA_RETIRO] || '').trim();
            const nombre = (values[col.NOMBRE] || '').trim();

            // Derivar estado
            const estado = this.calcularEstado(entrega, fechaRetiro, confirma, reparacion);

            data.push({
                fecha, orden, telefono, consola, serie, falla,
                observaciones, tecnico, reparacion, costoTecnico,
                confirma, precio, entrega, fechaRetiro, nombre, estado,
                rawValues: values
            });
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

    calcularEstado(entrega, fechaRetiro, confirma, reparacion) {
        if (fechaRetiro && fechaRetiro !== '') return 'Entregado';
        if (entrega && entrega !== '') return 'Listo para retirar';
        if (reparacion && reparacion !== '') return 'En reparación';
        if (confirma && confirma.toLowerCase() === 'si') return 'Presupuesto confirmado';
        if (confirma && confirma.toLowerCase() === 'no') return 'No aceptado';
        return 'Recibido';
    }

    applyFilters() {
        let filtered = [...this.data];

        if (this.currentFilter !== 'todos') {
            filtered = filtered.filter(r => {
                const estado = r.estado.toLowerCase();
                switch (this.currentFilter) {
                    case 'recibidos': return estado === 'recibido';
                    case 'presupuesto': return estado === 'presupuesto confirmado';
                    case 'reparacion': return estado === 'en reparación';
                    case 'listos': return estado === 'listo para retirar';
                    case 'entregados': return estado === 'entregado';
                    case 'no_aceptado': return estado === 'no aceptado';
                    default: return true;
                }
            });
        }

        if (this.searchTerm) {
            filtered = filtered.filter(r => {
                const searchFields = [
                    r.orden, r.telefono, r.consola, r.serie,
                    r.falla, r.tecnico, r.reparacion, r.observaciones, r.nombre
                ].join(' ').toLowerCase();
                return searchFields.includes(this.searchTerm);
            });
        }

        filtered.sort((a, b) => {
            const aVal = parseInt(a.orden) || 0;
            const bVal = parseInt(b.orden) || 0;
            return this.sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
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
                <td><strong>${repair.orden}</strong></td>
                <td>${repair.fecha || '—'}</td>
                <td>
                    <div>${repair.consola || '—'}</div>
                    ${repair.serie ? `<small style="color: var(--text-secondary)">S/N: ${repair.serie}</small>` : ''}
                </td>
                <td>${repair.telefono || '—'}</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(repair.estado)}">
                        <span class="status-dot"></span>
                        ${repair.estado}
                    </span>
                </td>
                <td>${repair.precio ? `$${repair.precio}` : '—'}</td>
                <td>
                    <span class="confirm-badge ${repair.confirma.toLowerCase() === 'si' ? 'si' : 'no'}">
                        ${repair.confirma || 'Pendiente'}
                    </span>
                </td>
                <td>
                    <div class="quick-actions">
                        <button class="action-btn edit" onclick="app.editRepair('${repair.orden}')" data-tooltip="Editar">✏️</button>
                        <button class="action-btn" onclick="app.printReceipt('${repair.orden}')" data-tooltip="Imprimir comprobante">🖨️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (totalPages <= 1) { pagination.innerHTML = ''; return; }

        let html = `<button class="pagination-btn" onclick="app.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>← Ant.</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="app.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += `<span style="color: var(--text-secondary)">...</span>`;
            }
        }

        html += `<button class="pagination-btn" onclick="app.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>Sig. →</button>`;
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
        const map = {
            'recibido': 'recibido',
            'presupuesto confirmado': 'presupuesto',
            'en reparación': 'reparacion',
            'listo para retirar': 'listo',
            'entregado': 'entregado',
            'no aceptado': 'cancelado'
        };
        return map[status.toLowerCase()] || 'recibido';
    }

    updateStats() {
        const stats = {
            total: this.data.length,
            recibidos: this.data.filter(r => r.estado === 'Recibido').length,
            enProceso: this.data.filter(r => ['Presupuesto confirmado', 'En reparación'].includes(r.estado)).length,
            listos: this.data.filter(r => r.estado === 'Listo para retirar').length,
            entregados: this.data.filter(r => r.estado === 'Entregado').length,
            noAceptados: this.data.filter(r => r.estado === 'No aceptado').length
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
                    <div class="stat-value">${stats.noAceptados}</div>
                    <div class="stat-label">No Aceptados</div>
                </div>
            `;
        }

        document.querySelectorAll('.filter-tab .count').forEach(el => {
            const filter = el.closest('.filter-tab').dataset.filter;
            el.textContent = this.getFilterCount(filter);
        });
    }

    getFilterCount(filter) {
        switch (filter) {
            case 'todos': return this.data.length;
            case 'recibidos': return this.data.filter(r => r.estado === 'Recibido').length;
            case 'presupuesto': return this.data.filter(r => r.estado === 'Presupuesto confirmado').length;
            case 'reparacion': return this.data.filter(r => r.estado === 'En reparación').length;
            case 'listos': return this.data.filter(r => r.estado === 'Listo para retirar').length;
            case 'entregados': return this.data.filter(r => r.estado === 'Entregado').length;
            case 'no_aceptado': return this.data.filter(r => r.estado === 'No aceptado').length;
            default: return 0;
        }
    }

    // ============ CLIENT PORTAL ============

    searchClientRepair() {
        const input = document.getElementById('clientSearch');
        const orderId = input.value.trim();
        if (!orderId) {
            this.showMessage('Ingresá tu número de orden', 'error');
            return;
        }

        const result = this.data.find(r => r.orden === orderId);
        const resultDiv = document.getElementById('repairResult');

        if (result) {
            this.renderClientResult(result);
            resultDiv.classList.add('show');
            document.getElementById('searchError').classList.remove('show');
        } else {
            resultDiv.classList.remove('show');
            this.showMessage('No se encontró ninguna reparación con ese número', 'error');
        }
    }

    async confirmarPresupuesto(orden, valor, waUrl) {
        if (CONFIG.SCRIPT_URL) {
            await this.submitToScript({
                action: 'confirm',
                orden: orden,
                confirma: valor
            });
        }

        const repair = this.data.find(r => r.orden === orden);
        if (repair) repair.confirma = valor;

        if (waUrl) window.open(waUrl, '_blank');

        this.renderClientResult(repair);
    }

    renderClientResult(repair) {
        const resultDiv = document.getElementById('repairResult');
        const estadoClass = this.getStatusClass(repair.estado);
        const confirmadoClass = (repair.confirma || '').toLowerCase() === 'si' ? 'si' : 'no';
        const pendiente = !repair.confirma || repair.confirma === '';

        const waAceptar = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent('Hola! Te escribo por la orden N°' + repair.orden + ' y quiero aceptar la reparacion. Presupuesto: $' + repair.precio)}`;
        const waRechazar = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent('Hola! Te escribo por la orden N°' + repair.orden + ' y quiero cancelar la reparacion.')}`;

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
                    <label>Consola / Dispositivo</label>
                    <div class="value">${repair.consola || 'No especificado'}</div>
                </div>
                <div class="repair-field">
                    <label>N.º de Serie</label>
                    <div class="value">${repair.serie || 'No especificado'}</div>
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
                    <div class="value price">${repair.precio ? '$' + repair.precio : 'Pendiente'}</div>
                </div>
                <div class="repair-field">
                    <label>Presupuesto</label>
                    <div class="value">
                        <span class="confirm-badge ${confirmadoClass}">
                            ${repair.confirma === 'Si' ? 'Aceptado' : repair.confirma === 'No' ? 'No aceptado' : 'Pendiente'}
                        </span>
                    </div>
                </div>
                <div class="repair-field">
                    <label>Entrega en Local</label>
                    <div class="value">${repair.entrega || 'Pendiente'}</div>
                </div>
                <div class="repair-field">
                    <label>Fecha de Retiro</label>
                    <div class="value">
                        ${repair.fechaRetiro ? 
                            '<span class="status-badge listo"><span class="status-dot"></span>Retirado el ' + repair.fechaRetiro + '</span>' : 
                            '<span style="color: var(--text-secondary)">Aún no retirado</span>'}
                    </div>
                </div>
                <div class="repair-field">
                    <label>Observaciones</label>
                    <div class="value">${repair.observaciones || 'Sin observaciones'}</div>
                </div>
            </div>
            ${pendiente && repair.precio ? `
            <div class="client-actions">
                <p class="client-actions-label">El presupuesto es de <strong>$${repair.precio}</strong>. ¿Aceptás?</p>
                <div class="client-actions-buttons">
                    <a class="btn btn-success btn-lg" href="#" onclick="app.confirmarPresupuesto('${repair.orden}', 'Si', '${waAceptar}'); return false;">
                        Aceptar presupuesto
                    </a>
                    <a class="btn btn-danger btn-lg" href="#" onclick="app.confirmarPresupuesto('${repair.orden}', 'No', '${waRechazar}'); return false;">
                        Rechazar
                    </a>
                </div>
            </div>
            ` : ''}
            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-dark); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <p style="color: var(--text-secondary); font-size: 0.875rem;">
                    <strong>Tenés preguntas?</strong> Contactanos al ${CONFIG.TELEFONO} (solo WhatsApp)
                </p>
            </div>
        `;
    }

    // ============ MODAL ============

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
            document.getElementById('editFecha').value = this.getToday();
            document.getElementById('editOrden').value = this.getNextOrden();
        }

        modal.classList.add('show');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('show');
    }

    fillForm(repair) {
        document.getElementById('editFecha').value = repair.fecha || '';
        document.getElementById('editOrden').value = repair.orden || '';
        document.getElementById('editTelefono').value = repair.telefono || '';
        document.getElementById('editNombre').value = repair.nombre || '';
        document.getElementById('editConsola').value = repair.consola || '';
        document.getElementById('editSerie').value = repair.serie || '';
        document.getElementById('editFalla').value = repair.falla || '';
        document.getElementById('editObservaciones').value = repair.observaciones || '';
        document.getElementById('editTecnico').value = repair.tecnico || '';
        document.getElementById('editReparacion').value = repair.reparacion || '';
        document.getElementById('editCostoTecnico').value = repair.costoTecnico || '';
        document.getElementById('editConfirma').value = repair.confirma || '';
        document.getElementById('editPrecio').value = repair.precio || '';
        document.getElementById('editEntrega').value = repair.entrega || '';
        document.getElementById('editFechaRetiro').value = repair.fechaRetiro || '';
    }

    editRepair(orden) {
        const repair = this.data.find(r => r.orden === orden);
        if (repair) this.openModal(repair);
    }

    getToday() {
        const d = new Date();
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    getNextOrden() {
        if (this.data.length === 0) return '11362';
        const max = Math.max(...this.data.map(r => parseInt(r.orden) || 0));
        return String(max + 1);
    }

    // Helper: submit params to Apps Script via fetch POST
    submitToScript(params) {
        const body = new URLSearchParams(params);
        return fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            body: body
        }).then(r => r.json()).catch(() => ({}));
    }

    async saveRepair() {
        const formData = this.getFormData();

        if (!formData.orden || !formData.fecha) {
            this.showModalMessage('Completá al menos la fecha y el número de orden', 'error');
            return;
        }

        if (!CONFIG.SCRIPT_URL) {
            this.showModalMessage('Para guardar necesitás configurar Google Apps Script. Verificá el README.', 'error');
            return;
        }

        try {
            await this.submitToScript({ action: 'save', ...formData });
            this.showMessage('Reparación guardada correctamente', 'success');
            this.closeModal();
            setTimeout(() => this.loadData(), 1500);
        } catch (error) {
            this.showModalMessage('Error al guardar: ' + error.message, 'error');
        }
    }

    // ============ SAVE AND PRINT ============

    async saveAndPrint() {
        const formData = this.getFormData();

        if (!formData.orden || !formData.fecha) {
            this.showModalMessage('Completá al menos la fecha y el número de orden', 'error');
            return;
        }

        if (CONFIG.SCRIPT_URL) {
            try {
                await this.submitToScript({ action: 'save', ...formData });
            } catch (e) {
                // Continue to print even if save fails
            }
        }

        this.printReceiptFromData(formData);
        this.closeModal();
        this.showMessage('Comprobante abierto para imprimir', 'success');
        setTimeout(() => this.loadData(), 1500);
    }

    getFormData() {
        return {
            fecha: document.getElementById('editFecha').value,
            orden: document.getElementById('editOrden').value,
            telefono: document.getElementById('editTelefono').value,
            nombre: document.getElementById('editNombre').value,
            consola: document.getElementById('editConsola').value,
            serie: document.getElementById('editSerie').value,
            falla: document.getElementById('editFalla').value,
            observaciones: document.getElementById('editObservaciones').value,
            tecnico: document.getElementById('editTecnico').value,
            reparacion: document.getElementById('editReparacion').value,
            costoTecnico: document.getElementById('editCostoTecnico').value,
            confirma: document.getElementById('editConfirma').value,
            precio: document.getElementById('editPrecio').value,
            entrega: document.getElementById('editEntrega').value,
            fechaRetiro: document.getElementById('editFechaRetiro').value
        };
    }

    // ============ PRINT RECEIPT ============

    printReceipt(orden) {
        const repair = this.data.find(r => r.orden === orden);
        if (!repair) return;
        this.printReceiptFromData(repair);
    }

    printReceiptFromData(repair) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprobante Orden ${repair.orden}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; color: #000; font-size: 11px; }
                    .page { padding: 15px 20px; page-break-after: always; }
                    .page:last-child { page-break-after: avoid; }
                    
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
                    .header h1 { font-size: 16px; letter-spacing: 1px; }
                    .header .subtitle { font-size: 12px; font-weight: bold; }
                    .header .whatsapp { font-size: 10px; margin-top: 4px; }
                    
                    .field { display: flex; margin-bottom: 5px; font-size: 11px; line-height: 1.4; }
                    .field .label { font-weight: bold; min-width: 130px; }
                    .field .value { flex: 1; border-bottom: 1px dotted #aaa; padding-left: 5px; }
                    
                    .section { margin-top: 12px; padding-top: 8px; border-top: 1px solid #000; }
                    .section-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; text-decoration: underline; }
                    
                    .terms { margin-top: 15px; font-size: 9px; line-height: 1.5; color: #333; }
                    .terms p { margin-bottom: 3px; }
                    
                    .separator { text-align: center; margin: 15px 0; font-size: 10px; color: #999; letter-spacing: 2px; }
                    
                    .copy-label { text-align: center; font-size: 9px; margin-top: 10px; padding-top: 5px; border-top: 1px dashed #999; color: #666; }
                    
                    .cost-line { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; }
                    
                    @media print {
                        body { padding: 0; }
                        .page { padding: 10px 15px; }
                    }
                </style>
            </head>
            <body>
                <!-- COPIA 1 - ORIGINAL -->
                <div class="page">
                    <div class="header">
                        <h1>${CONFIG.EMPRESA}</h1>
                        <div class="subtitle">${CONFIG.SUBTITULO}</div>
                        <div class="whatsapp">Solo mensajes de WhatsApp ${CONFIG.TELEFONO}</div>
                    </div>
                    
                    <div class="field"><span class="label">Fecha:</span><span class="value">${repair.fecha || '___/___/______'}</span></div>
                    <div class="field"><span class="label">Nº de orden:</span><span class="value">${repair.orden}</span></div>
                    <div class="field"><span class="label">Nombre:</span><span class="value">${repair.nombre || ''}</span></div>
                    <div class="field"><span class="label">Teléfono:</span><span class="value">${repair.telefono || ''}</span></div>
                    <div class="field"><span class="label">Consola:</span><span class="value">${repair.consola || ''}</span></div>
                    <div class="field"><span class="label">N.º de Serie:</span><span class="value">${repair.serie || ''}</span></div>
                    <div class="field"><span class="label">Falla acusada:</span><span class="value">${repair.falla || ''}</span></div>
                    <div class="field"><span class="label">Obs.:</span><span class="value">${repair.observaciones || ''}</span></div>
                    
                    <div class="section">
                        <div class="field"><span class="label">Costo Presupuesto:</span><span class="value">${repair.costoTecnico || ''}</span></div>
                        <div class="cost-line">
                            <span></span>
                            <span></span>
                        </div>
                        <div class="field"><span class="label">Costo de Reparación:</span><span class="value">${repair.precio || ''}</span></div>
                    </div>
                    
                    <div class="terms">
                        <p>Conservar este comprobante para retirar el equipo</p>
                        <p>*La demora del presupuesto se estima de 3 a 4 días.</p>
                        <p>*El valor presupuestado será mantenido por un plazo máximo de 24 Horas, pasado ese lapso será Re presupuestado.</p>
                        <p>*En caso contrario de no aceptar el presupuesto, el equipo será devuelto en un máximo de 3 dias.</p>
                        <p>*Pasados los 120 dias de la fecha en la que el equipo fuera reparado y/o devuelto por el tecnico, segun los articulos nº2375,2525 y 2526, el equipo sera considerado como abandonado, quedando a disposicion de la empresa el destino del mismo.</p>
                    </div>
                    
                    <div class="separator">............................. ....................................... ......................................</div>
                    
                    <!-- COPIA 2 -->
                    <div class="header" style="margin-top: 15px;">
                        <h1>${CONFIG.EMPRESA}</h1>
                        <div class="subtitle">${CONFIG.SUBTITULO}</div>
                        <div class="whatsapp">Solo mensajes de WhatsApp ${CONFIG.TELEFONO}</div>
                    </div>
                    
                    <div class="field"><span class="label">Fecha:</span><span class="value">${repair.fecha || '___/___/______'}</span></div>
                    <div class="field"><span class="label">Nº de orden:</span><span class="value">${repair.orden}</span></div>
                    <div class="field"><span class="label">Nombre:</span><span class="value">${repair.nombre || ''}</span></div>
                    <div class="field"><span class="label">Teléfono:</span><span class="value">${repair.telefono || ''}</span></div>
                    <div class="field"><span class="label">Consola:</span><span class="value">${repair.consola || ''}</span></div>
                    <div class="field"><span class="label">N.º de Serie:</span><span class="value">${repair.serie || ''}</span></div>
                    <div class="field"><span class="label">Falla acusada:</span><span class="value">${repair.falla || ''}</span></div>
                    <div class="field"><span class="label">Observaciones:</span><span class="value">${repair.observaciones || ''}</span></div>
                    
                    <div class="field" style="margin-top: 15px;"><span class="label">Costo Reparacion:</span><span class="value">___________________________</span></div>
                    
                    <div class="copy-label">Copia - Cliente</div>
                </div>
                
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // ============ EXPORT ============

    exportToCSV() {
        const headers = ['Fecha', 'Nº Orden', 'Teléfono', 'Consola', 'N. Serie', 'Falla', 'Observaciones', 'Técnico', 'Reparación', 'Costo Técnico', 'Confirma', 'Precio', 'Entrega', 'Fecha Retiro', 'Estado'];

        const rows = this.filteredData.map(r => [
            r.fecha, r.orden, r.telefono, r.consola, r.serie,
            r.falla, r.observaciones, r.tecnico, r.reparacion,
            r.costoTecnico, r.confirma, r.precio, r.entrega,
            r.fechaRetiro, r.estado
        ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','));

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reparaciones_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    // ============ UTILS ============

    showLoading(show) {
        const loader = document.getElementById('loading');
        if (loader) loader.style.display = show ? 'flex' : 'none';
    }

    showMessage(text, type = 'info') {
        const existing = document.querySelector('.message.show');
        if (existing) existing.classList.remove('show');

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
        setTimeout(() => msgDiv.classList.remove('show'), 6000);
    }

    showModalMessage(text, type = 'error') {
        const modal = document.querySelector('.modal');
        if (!modal) return;

        let msgDiv = document.getElementById('modalMessage');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.id = 'modalMessage';
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) {
                modalBody.insertBefore(msgDiv, modalBody.firstChild);
            }
        }

        const bgColor = type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
        const borderColor = type === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)';
        const textColor = type === 'error' ? '#fca5a5' : '#6ee7b7';

        msgDiv.style.cssText = `padding: 0.75rem 1rem; margin-bottom: 1rem; border-radius: 8px; font-size: 0.875rem; background: ${bgColor}; border: 1px solid ${borderColor}; color: ${textColor};`;
        msgDiv.innerHTML = text;

        setTimeout(() => { msgDiv.remove(); }, 6000);
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ReparacionesApp();
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
