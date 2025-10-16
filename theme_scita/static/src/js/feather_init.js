 /** @odoo-module **/

 import publicWidget from "@web/legacy/js/public/public_widget";


publicWidget.registry.FeatherIcon = publicWidget.Widget.extend({
    selector: '#wrapwrap',

    start() {
        this._super(...arguments);
        this._applyFeatherIcons();
        this._observeDomChanges();
        return Promise.resolve();
    },

    _applyFeatherIcons() {
        if (window.feather) {
            feather.replace();
        }
    },

    _observeDomChanges() {
        const observer = new MutationObserver(() => this._applyFeatherIcons());
        observer.observe(document.body, { childList: true, subtree: true });
    },
});

//Brands filter 
publicWidget.registry.brandFilterWidget = publicWidget.Widget.extend({
    
    selector: "#wrapwrap",
    
    start: function () {
    this._super(...arguments);

    const buttons = document.querySelectorAll("#brand_filter button:not(:disabled)");
    const brandCards = document.querySelectorAll(".brand-card");
    const searchInput = document.getElementById("brandSearch");

        if (!buttons.length || !brandCards.length || !searchInput) {
            return Promise.resolve();
        }

    let activeLetter = "all"; // Default

    buttons.forEach((btn) => {
            btn.addEventListener("click", function () {
                const clickedLetter = this.dataset.letter;

                // If the same active button is clicked again, toggle to 'all'
                if (activeLetter === clickedLetter && clickedLetter !== "all") {
                    activeLetter = "all";
                    buttons.forEach((b) => b.classList.remove("active"));
                    document.querySelector('#brand_filter button[data-letter="all"]').classList.add("active");

                    // Show all brand cards
                    brandCards.forEach((card) => {
                        card.style.display = "block";
                    });

                    // Clear search input
                    searchInput.value = "";
                    return;
                }

                // Update activeLetter
                activeLetter = clickedLetter;

                // Update button states
                buttons.forEach((b) => b.classList.remove("active"));
                this.classList.add("active");

                // Filter brand cards
                brandCards.forEach((card) => {
                    const cardLetter = card.dataset.letter;
                    card.style.display = (clickedLetter === "all" || cardLetter === clickedLetter) ? "block" : "none";
                });

                // Clear search input
                searchInput.value = "";
            });
        });

    searchInput.addEventListener("input", function () {
        const val = this.value.toLowerCase();

        brandCards.forEach((card) => {
            const brandName = card.dataset.name.toLowerCase();
            card.style.display = brandName.includes(val) ? "block" : "none";
        });

        // Remove active state from all letter buttons
        buttons.forEach((b) => b.classList.remove("active"));
    });

    return Promise.resolve();
}
});