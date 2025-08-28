/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";
import { BuilderAction } from "@html_builder/core/builder_action";

// ---------------------------------------------
// Shared Modal Logic
// ---------------------------------------------
async function openMultiCategorySliderModal(snippetEl) {
    // Render modal
    const modalEl = renderToElement("theme_scita.multi_product_custom_slider_block");
    document.body.appendChild(modalEl);

    // Show Bootstrap modal
    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#slider_type");
    const submitBtn = modalEl.querySelector("#snippnet_submit");
    const cancelBtn = modalEl.querySelector("#cancel");

    // Fetch options
    const res = await rpc("/theme_scita/product_multi_get_options", {});
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
        snippetEl.setAttribute(
            "data-multi-cat-slider-id",
            `multi-cat-myowl${sliderTypeSelect.value}`
        );
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

    // Cleanup
    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// ---------------------------------------------
// Snippet Drop Plugin
// ---------------------------------------------
class FashionMultiCatCustomSnippetPlugin extends Plugin {
    static id = "fashionMultiCatCustomSnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".fashion_multi_category_slider"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("fashion_multi_category_slider")) {
            return;
        }

        snippetEl.classList.remove("hidden");
        snippetEl.querySelector(".owl-carousel")?.replaceChildren();

        // Open modal
        openMultiCategorySliderModal(snippetEl);
    }
}

registry.category("website-plugins").add(
    FashionMultiCatCustomSnippetPlugin.id,
    FashionMultiCatCustomSnippetPlugin
);

// ---------------------------------------------
// Modify Button Plugin
// ---------------------------------------------
class FashionMultiCatSnippetPlugin extends Plugin {
    static id = "fashionMultiCatSnippet";
    static dependencies = ["history", "media"];
    selector = ".fashion_multi_category_slider";

    resources = {
        builder_options: {
            template: "fashion_multi_cat_custom_snippet",
            selector: ".fashion_multi_category_slider",
        },
        so_content_addition_selector: [".fashion_multi_category_slider"],
        builder_actions: {
            ModifyBtnAction,
        },
    };
}

export class ModifyBtnAction extends BuilderAction {
    static id = "fashion_modifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            // Instead of alert, open same modal logic
            openMultiCategorySliderModal(editingElement);
        }
    }

    isApplied({ editingElement }) {
        return editingElement.dataset.modified === "true";
    }
}

registry.category("website-plugins").add(
    FashionMultiCatSnippetPlugin.id,
    FashionMultiCatSnippetPlugin
);
