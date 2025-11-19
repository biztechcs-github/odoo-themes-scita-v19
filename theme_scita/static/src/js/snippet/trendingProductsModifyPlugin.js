/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";
import { BuilderAction } from "@html_builder/core/builder_action";

// --------------------------------------------------
// Modal Logic for Trending Products Snippet
// --------------------------------------------------
async function openTrendingProductsModal(snippetEl) {
    // Render modal
    const modalEl = renderToElement("theme_scita.scita_trending_products_modal");
    document.body.appendChild(modalEl);

    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#slider_type");
    const submitBtn = modalEl.querySelector("#trending_category_data_submit");
    const cancelBtn = modalEl.querySelector("#cancel");

    // Load trending category options
    const res = await rpc("/theme_scita/trending_category_get_options", {});
    sliderTypeSelect.innerHTML = `<option value="0">-- Select --</option>`;
    res.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.id;
        option.textContent = opt.name;
        sliderTypeSelect.appendChild(option);
    });

    // Pre-fill if exists
    const currentType = snippetEl.getAttribute("data-cat-slider-id");
    if (currentType) {
        sliderTypeSelect.value = currentType;
    }

    // Submit
    submitBtn.addEventListener("click", () => {
        const selectedOpt = sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const type = selectedOpt && selectedOpt.value !== "0" ? selectedOpt.text : _t("Trending Products");

        snippetEl.setAttribute("data-cat-slider-id", sliderTypeSelect.value);
        
        // Use the original placeholder template structure to maintain consistency
        snippetEl.innerHTML = `
            <div class="retail_trending_products">
                <div class="container">
                    <div class="lns-inner latest-trendy-section">
                        <div class="row">
                            <div class="lns-post">
                                <div class="psb-inner">
                                    <div class="title-block">
                                        <h2 class="section-title style1">${_t(type)}</h2>
                                    </div>
                                    <div class="category-slider-placeholder">
                                        <img src="/theme_scita/static/src/img/TreandingProduct1.png" alt="Trending Products" class="img-fluid"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        myModal.hide();
    });

    // Cancel handler
    cancelBtn?.addEventListener("click", () => {
        myModal.hide();
    });

    // Cleanup after close
    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// --------------------------------------------------
// Snippet Drop Plugin
// --------------------------------------------------
class TrendingProductsSnippetPlugin extends Plugin {
    static id = "trendingProductsSnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".theme_scita_trending_products"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("theme_scita_trending_products")) {
            return;
        }
        snippetEl.classList.remove("o_hidden");
        snippetEl.innerHTML = "";

        // open modal once after drop
        openTrendingProductsModal(snippetEl);
    }
}

registry.category("website-plugins").add(
    TrendingProductsSnippetPlugin.id,
    TrendingProductsSnippetPlugin
);

// --------------------------------------------------
// Modify Button Action
// --------------------------------------------------
export class TrendingProductsModifyBtnAction extends BuilderAction {
    static id = "trending_products_modifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openTrendingProductsModal(editingElement);
        }
    }

    isApplied() {
        return false;
    }
}

// --------------------------------------------------
// Register Modify Button Plugin
// --------------------------------------------------
class TrendingProductsModifyPlugin extends Plugin {
    static id = "trendingProductsModifyPlugin";
    static dependencies = [];
    selector = ".theme_scita_trending_products";

    resources = {
        builder_options: {
            template: "theme_scita_trending_products_option",
            selector: ".theme_scita_trending_products",
        },
        so_content_addition_selector: [".theme_scita_trending_products"],
        builder_actions: {
            TrendingProductsModifyBtnAction,
        },
    };
}

registry.category("website-plugins").add(
    TrendingProductsModifyPlugin.id,
    TrendingProductsModifyPlugin
);
