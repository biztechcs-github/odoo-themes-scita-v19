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

    // Pre-fill if exists
    const currentType = snippetEl.getAttribute("data-multi-cat-slider-type");
    if (currentType) {
        sliderTypeSelect.value = currentType;
    }

    // Handle submit
    submitBtn.addEventListener("click", () => {
        const selectedOpt = sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const type = selectedOpt ? selectedOpt.text : _t("Multi Product Slider");

        snippetEl.setAttribute("data-multi-cat-slider-type", sliderTypeSelect.value);
        snippetEl.setAttribute(
            "data-multi-cat-slider-id",
            `multi-cat-myowl${sliderTypeSelect.value}`
        );
        
        // Use the original placeholder template structure to maintain consistency
        snippetEl.innerHTML = `
            <div class="container">
                <div class="row our-categories">
                    <div class="col-md-12">
                        <div class="title-block">
                            <h4 id="snippet-title" class="section-title style1">
                                <span>${_t(type)}</span>
                            </h4>
                        </div>
                        <div class="category-slider-placeholder">
                            <img src="/theme_scita/static/src/img/feature-product.webp" alt="Multi Product Slider" class="img-fluid"/>
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
        snippetEl.classList.remove("o_hidden");
        snippetEl.innerHTML = "";

        // open modal once after drop
        openMultiCategorySliderModal(snippetEl);
    }
}

registry.category("website-plugins").add(
    FashionMultiCatCustomSnippetPlugin.id,
    FashionMultiCatCustomSnippetPlugin
);

// ---------------------------------------------
// Modify Button Action
// ---------------------------------------------
export class FashionMultiCatModifyBtnAction extends BuilderAction {
    static id = "fashion_multi_cat_modifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openMultiCategorySliderModal(editingElement);
        }
    }

    isApplied() {
        return false;
    }
}

// ---------------------------------------------
// Register Modify Button Plugin
// ---------------------------------------------
class FashionMultiCatSnippetModifyPlugin extends Plugin {
    static id = "fashionMultiCatSnippetModifyPlugin";
    static dependencies = [];
    selector = ".fashion_multi_category_slider";

    resources = {
        builder_options: {
            template: "fashion_multi_cat_custom_snippet",
            selector: ".fashion_multi_category_slider",
        },
        so_content_addition_selector: [".fashion_multi_category_slider"],
        builder_actions: {
            FashionMultiCatModifyBtnAction,
        },
    };
}

registry.category("website-plugins").add(
    FashionMultiCatSnippetModifyPlugin.id,
    FashionMultiCatSnippetModifyPlugin
);
