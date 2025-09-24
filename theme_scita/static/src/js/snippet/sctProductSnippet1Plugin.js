/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";
import { BuilderAction } from "@html_builder/core/builder_action";

// --------------------------------------------------
// Shared Modal Logic for Dynamic Product Snippet
// --------------------------------------------------
async function openDynamicProductModal(snippetEl) {
    // Render modal template
    const modalEl = renderToElement("theme_scita.scita_dynamic_product_snippet_configuration");
    document.body.appendChild(modalEl);

    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#slider_type");
    const submitBtn = modalEl.querySelector("#snippnet_submit");
    const cancelBtn = modalEl.querySelector("#cancel");

    // Load product configuration options
    const res = await rpc("/theme_scita/product_configuration", {});
    sliderTypeSelect.innerHTML = "";
    res.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.id;
        option.textContent = opt.name;
        sliderTypeSelect.appendChild(option);
    });

    // Handle submit
    submitBtn.addEventListener("click", () => {
        const selectedOption =
            sliderTypeSelect.selectedOptions[0]?.text || _t("Multi Product Slider");

        snippetEl.setAttribute("data-multi-cat-slider-type", sliderTypeSelect.value);
        snippetEl.setAttribute("data-multi-cat-slider-id", "multi-cat-myowl" + sliderTypeSelect.value);

        snippetEl.innerHTML = `
            <div class="container">
                <div class="row our-categories">
                    <div class="col-md-12">
                        <div class="title-block">
                            <h4 class="section-title style1">
                                <span>${_t(selectedOption)}</span>
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        `;

        myModal.hide();
    });

    // Handle cancel
    cancelBtn?.addEventListener("click", () => {
        myModal.hide();
    });

    // Cleanup modal after close
    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// --------------------------------------------------
// Snippet Drop Plugin
// --------------------------------------------------
class SctProductSnippet1Plugin extends Plugin {
    static id = "sctProductSnippet1";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".sct_product_snippet_1"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("sct_product_snippet_1")) {
            return;
        }

        snippetEl.classList.remove("hidden");
        snippetEl.querySelector(".owl-carousel")?.replaceChildren();

        // Open modal when dropped
        openDynamicProductModal(snippetEl);
    }
}

registry.category("website-plugins").add(
    SctProductSnippet1Plugin.id,
    SctProductSnippet1Plugin
);

// --------------------------------------------------
// Modify Button Plugin
// --------------------------------------------------
class SctProductSnippet1ModifyPlugin extends Plugin {
    static id = "sctProductModifyBtn";
    static dependencies = ["history", "media"];
    selector = ".sct_product_snippet_1";

    resources = {
        builder_options: {
            template: "sct_product_snippet_1_option",
            selector: ".sct_product_snippet_1",
        },
        so_content_addition_selector: [".sct_product_snippet_1"],
        builder_actions: {
            ModifyBtnAction,
        },
    };
}

export class ModifyBtnAction extends BuilderAction {
    static id = "sctProductModifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openDynamicProductModal(editingElement);
        }
    }

    isApplied({ editingElement }) {
        return editingElement.dataset.modified === "true";
    }
}

registry.category("website-plugins").add(
    SctProductSnippet1ModifyPlugin.id,
    SctProductSnippet1ModifyPlugin
);
