// ========================================
// 🗑️ BIN CARD COMPONENT
// ========================================

class Bincard extends HTMLElement {
    connectedCallback() {
        const bin_name = this.getAttribute("bin_name");
        const indicator = this.getAttribute("indicator");
        const mode = this.getAttribute("mode");
        const navigateTo = this.getAttribute("navigateTo");
        
        this.innerHTML = `
            <div class="bin card">
                <div class="card header">
                    <div class="bin_name">${bin_name}</div>
                    <div class="mode-text">
                        <img class="indicator" src="${indicator}" alt="">
                        <span class="mode">${mode}</span>
                    </div>
                </div>
                <img class="mode-confirmation-dummy bin-card" src="img/cliparts/Bin(Hero-sec).png" alt="">
                <a class="btn bin" href="${navigateTo}">Select bin</a>
            </div>
        `;
    }
}

customElements.define("bin-card", Bincard);

console.log('✅ Bin Card component loaded');