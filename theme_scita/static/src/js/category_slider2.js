/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { renderToElement } from "@web/core/utils/render";
import { rpc } from "@web/core/network/rpc";
import { BuilderAction } from "@html_builder/core/builder_action";

// ------------------------------------------------------
// Shared Modal Logic for Category Slider
// ------------------------------------------------------
async function openCategorySliderModal(snippetEl) {
    // Render modal template
    const modalEl = renderToElement("theme_scita.scita_dynamic_category_slider");
    document.body.appendChild(modalEl);

    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#slider_type");
    const submitBtn = modalEl.querySelector("#cat_sub_data");
    const cancelBtn = modalEl.querySelector("#cancel");

    // Fetch category options from controller
    const res = await rpc("/theme_scita/category_get_options", {});
    sliderTypeSelect.innerHTML = "";
    res.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.name;
        sliderTypeSelect.appendChild(opt);
    });

    // Pre-fill if exists
    const currentType = snippetEl.getAttribute("data-cat-slider-id");
    if (currentType) {
        sliderTypeSelect.value = currentType;
    }

    // Submit handler
    submitBtn.addEventListener("click", () => {
        snippetEl.setAttribute("data-cat-slider-id", sliderTypeSelect.value);

        const selectedOpt = sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const typeText = selectedOpt ? selectedOpt.text : _t("Category Slider");

        // Replace snippet content
        snippetEl.innerHTML = `
            <div class="container">
                <div class="block-title">
                    <h3 class="fancy">${_t(typeText)}</h3>
                </div>
            </div>
        `;
        myModal.hide();
    });

    // Cancel handler
    cancelBtn?.addEventListener("click", () => {
        myModal.hide();
    });

    // Cleanup
    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// ------------------------------------------------------
// Snippet Drop Plugin
// ------------------------------------------------------
class CategorySliderPlugin2 extends Plugin {
    static id = "categorySliderSnippet2";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".cat_slider_4"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("cat_slider_4")) {
            return;
        }

        snippetEl.classList.remove("o_hidden");
        snippetEl.innerHTML = "";

        // Open modal after drop
        openCategorySliderModal(snippetEl);
    }
}
registry.category("website-plugins").add(
    CategorySliderPlugin2.id,
    CategorySliderPlugin2
);

// ------------------------------------------------------
// Modify Button Action
// ------------------------------------------------------
export class CategorySlider2ModifyBtnAction extends BuilderAction {
    static id = "cat_slider2_modifyBtn";    

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
class CategorySlider2ModifyPlugin extends Plugin {
    static id = "categorySlider2ModifyPlugin";
    static dependencies = [];
    selector = ".cat_slider_4";

    resources = {
        builder_options: {
            template: "theme_scita_category_slider_4_option",
            selector: ".cat_slider_4",
        },
        so_content_addition_selector: [".cat_slider_4"],
        builder_actions: {
            CategorySlider2ModifyBtnAction,
        },
    };
}

registry.category("website-plugins").add(
    CategorySlider2ModifyPlugin.id,
    CategorySlider2ModifyPlugin
);
