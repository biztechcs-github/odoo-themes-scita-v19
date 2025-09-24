/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";
import { BuilderAction } from "@html_builder/core/builder_action";

// -------------------------------------------------
// Shared Modal Logic
// -------------------------------------------------
async function openDealMultiProductModal(snippetEl) {
    const modalEl = renderToElement("theme_scita.multi_product_deal_custom_slider_configuration");
    document.body.appendChild(modalEl);

    const myModal = new Modal(modalEl);
    myModal.show();

    const $sliderDeals = modalEl.querySelector("#slider_deals");
    const $cancel = modalEl.querySelector("#cancel");
    const $submit = modalEl.querySelector("#snippnet_submit");

    // Load options dynamically
    rpc('/theme_scita/deal_get_options', {}).then((res) => {
        $sliderDeals.innerHTML = "";
        res.forEach((r) => {
            const opt = document.createElement("option");
            opt.value = r.id;
            opt.textContent = r.name;
            $sliderDeals.appendChild(opt);
        });
    });

    // Submit handler
    $submit.addEventListener("click", () => {
        const dateVal = modalEl.querySelector("input#date").value;
        const date = new Date(dateVal);

        const hours = parseInt(modalEl.querySelector("input#hours").value) || 0;
        const mins = parseInt(modalEl.querySelector("input#minutes").value) || 0;
        const secs = parseInt(modalEl.querySelector("input#second").value) || 0;

        const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        let formattedDate = "nan";
        if (!isNaN(date.getTime())) {
            formattedDate = `${monthShortNames[date.getMonth()]} ${date.getDate()},${date.getFullYear()} ${hours}:${mins}:${secs}`;
        } else {
            alert("Invalid Time Format. Please enter correct format of Time");
        }

        // Save attributes
        snippetEl.setAttribute("data-date", formattedDate);
        snippetEl.setAttribute("data-msg", modalEl.querySelector("input#sale_over").value);
        snippetEl.setAttribute("data-multi-deal-of-day-type", $sliderDeals.value);
        snippetEl.setAttribute("data-multi-cat-dealer-id", "multi-cat-myowl" + $sliderDeals.value);

        // Replace inner content
        let type = $sliderDeals.options[$sliderDeals.selectedIndex]?.text || _t("Multi Product Deal Slider");

        snippetEl.innerHTML = `
            <div class="container">
                <div class="row our-categories">
                    <div class="col-md-12">
                        <div class="title-block">
                            <h4 class="section-title style1">
                                <span>${_t(type)}</span>
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        `;

        myModal.hide();
    });

    // Cancel handler
    $cancel?.addEventListener("click", () => {
        myModal.hide();
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// -------------------------------------------------
// Snippet Drop Plugin
// -------------------------------------------------
class DealSellerMultiProductSnippetPlugin extends Plugin {
    static id = "dealSellerMultiProductSnippet";

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".deal_multi_product_slider"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("deal_multi_product_slider")) {
            return;
        }
        snippetEl.innerHTML = "";
        openDealMultiProductModal(snippetEl);
    }
}
registry.category("website-plugins").add(
    DealSellerMultiProductSnippetPlugin.id,
    DealSellerMultiProductSnippetPlugin
);

// -------------------------------------------------
// Modify Button Action
// -------------------------------------------------
export class DealSellerMultiProductModifyAction extends BuilderAction {
    static id = "dealSellerMultiProductModify";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openDealMultiProductModal(editingElement);
        }
    }

    isApplied() {
        return false;
    }
}

// -------------------------------------------------
// Modify Plugin
// -------------------------------------------------
class DealSellerMultiProductModifyPlugin extends Plugin {
    static id = "dealSellerMultiProductModifyPlugin";
    static dependencies = ["history", "media"];
    selector = ".deal_multi_product_slider";

    resources = {
        builder_options: {
            template: "deal_seller_multi_product_custom_snippet",
            selector: ".deal_multi_product_slider",
        },
        so_content_addition_selector: [".deal_multi_product_slider"],
        builder_actions: {
            DealSellerMultiProductModifyAction,
        },
    };
}
registry.category("website-plugins").add(
    DealSellerMultiProductModifyPlugin.id,
    DealSellerMultiProductModifyPlugin
);
