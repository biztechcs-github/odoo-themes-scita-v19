/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { renderToElement } from "@web/core/utils/render";
import { rpc } from "@web/core/network/rpc";
import { BuilderAction } from "@html_builder/core/builder_action";

// ------------------------------------------------------
// Shared Modal Logic
// ------------------------------------------------------
async function openCategorySliderModal(snippetEl) {
    // Render modal template
    const modalEl = renderToElement("theme_scita.scita_category_gray_slider_configration");
    document.body.appendChild(modalEl);

    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#slider_type");
    const colorInput = modalEl.querySelector("#color");
    const submitBtn = modalEl.querySelector("#pro_category_sub_data");
    const cancelBtn = modalEl.querySelector("#cancel");

    // Fetch slider types
    const res = await rpc("/theme_scita/category_get_options", {});
    sliderTypeSelect.innerHTML = "";
    res.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.name;
        sliderTypeSelect.appendChild(opt);
    });

    // Pre-fill from attributes
    const currentType = snippetEl.getAttribute("data-category-config-type");
    const currentColor = snippetEl.getAttribute("data-category-color");
    if (currentType) sliderTypeSelect.value = currentType;
    if (currentColor) colorInput.value = currentColor;

    // Submit
    submitBtn.addEventListener("click", () => {
        const selectedOpt = sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const typeText = selectedOpt ? selectedOpt.text : _t("Our Brands");

        snippetEl.setAttribute("data-category-config-type", sliderTypeSelect.value);
        snippetEl.setAttribute("data-category-config-id", sliderTypeSelect.value);
        snippetEl.setAttribute("data-category-color", colorInput.value);

        snippetEl.innerHTML = `
            <div class="container">
                <div class="row oe_our_slider">
                    <div class="col-md-12">
                        <div class="title-block">
                            <h4 class="section-title style1">
                                <span>${_t(typeText)}</span>
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        `;

        myModal.hide();
    });

    cancelBtn?.addEventListener("click", () => {
        myModal.hide();
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// ------------------------------------------------------
// Snippet Drop Plugin
// ------------------------------------------------------
class CategorySliderPlugin3 extends Plugin {
    static id = "categorySliderSnippet3";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".oe_category_slider"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("oe_category_slider")) return;

        snippetEl.classList.remove("hidden");
        snippetEl.innerHTML = "";

        openCategorySliderModal(snippetEl);
    }
}
registry.category("website-plugins").add(
    CategorySliderPlugin3.id,
    CategorySliderPlugin3
);

// ------------------------------------------------------
// Modify Button Action
// ------------------------------------------------------
export class CategorySlider3ModifyBtnAction extends BuilderAction {
    static id = "cat_slider3_modifyBtn";

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
class CategorySlider3ModifyPlugin extends Plugin {
    static id = "categorySlider3ModifyPlugin";
    static dependencies = [];
    selector = ".oe_category_slider";

    resources = {
        builder_options: {
            template: "product_category_option",
            selector: ".oe_category_slider",
        },
        so_content_addition_selector: [".oe_category_slider"],
        builder_actions: {
            CategorySlider3ModifyBtnAction,
        },
    };
}
registry.category("website-plugins").add(
    CategorySlider3ModifyPlugin.id,
    CategorySlider3ModifyPlugin
);
