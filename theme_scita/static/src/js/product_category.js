/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { renderToElement } from "@web/core/utils/render";
import { rpc } from "@web/core/network/rpc";
import { BuilderAction } from "@html_builder/core/builder_action";

// ------------------------------------------------------
// Shared Modal Logic for Category/Product Slider
// ------------------------------------------------------
async function openCategorySliderModal(snippetEl) {
    // Render modal template
    const modalEl = renderToElement("theme_scita.scita_product_category_img_slider_config");
    document.body.appendChild(modalEl);

    // Bootstrap modal
    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#slider_type");
    const cancelBtn = modalEl.querySelector("#cancel");
    const submitBtn = modalEl.querySelector("#snippnet_submit");

    // Fetch slider types from controller
    const res = await rpc("/theme_scita/product_category_slider", {});
    sliderTypeSelect.innerHTML = "";
    res.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.name;
        sliderTypeSelect.appendChild(opt);
    });

    // Pre-fill if exists
    const currentType = snippetEl.getAttribute("data-multi-cat-slider-type");
    if (currentType) {
        sliderTypeSelect.value = currentType;
    }

    // Submit handler
    submitBtn.addEventListener("click", () => {
        const selectedOpt = sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const type = selectedOpt ? selectedOpt.text : _t("Image Product/Category Snippet");

        snippetEl.setAttribute("data-multi-cat-slider-type", sliderTypeSelect.value);
        snippetEl.setAttribute("data-multi-cat-slider-id", "multi-cat-myowl" + sliderTypeSelect.value);

        // Replace snippet content
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
    cancelBtn?.addEventListener("click", () => {
        myModal.hide();
    });

    // Cleanup modal after close
    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// ------------------------------------------------------
// Snippet Drop Plugin
// ------------------------------------------------------
class ProductCategorySliderPlugin extends Plugin {
    static id = "productCategorySliderSnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".multi_product_and_category_slider"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("multi_product_and_category_slider")) {
            return;
        }

        snippetEl.classList.remove("hidden");
        snippetEl.innerHTML = "";

        // open modal once after drop
        openCategorySliderModal(snippetEl);
    }
}
registry.category("website-plugins").add(
    ProductCategorySliderPlugin.id,
    ProductCategorySliderPlugin
);

// ------------------------------------------------------
// Modify Button Action
// ------------------------------------------------------
export class ProductCategorySliderModifyBtnAction extends BuilderAction {
    static id = "product_category_modifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openCategorySliderModal(editingElement);
        }
    }

    isApplied() {
        return false;
    }
}

// Register plugin for Modify button
class ProductCategorySliderModifyPlugin extends Plugin {
    static id = "productCategorySliderModifyPlugin";
    static dependencies = [];
    selector = ".multi_product_and_category_slider";

    resources = {
        builder_options: {
            template: "product_category_img_slider_config_option",
            selector: ".multi_product_and_category_slider",
        },
        so_content_addition_selector: [".multi_product_and_category_slider"],
        builder_actions: {
            ProductCategorySliderModifyBtnAction,
        },
    };
}

registry.category("website-plugins").add(
    ProductCategorySliderModifyPlugin.id,
    ProductCategorySliderModifyPlugin
);
