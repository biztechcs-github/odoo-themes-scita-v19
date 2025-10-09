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

    // Bootstrap modal
    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#slider_type");
    const cancelBtn = modalEl.querySelector("#cancel");
    const submitBtn = modalEl.querySelector("#cat_sub_data");

    // Fetch category options
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
        const selectedOpt = sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const type = selectedOpt ? selectedOpt.text : _t("Category Slider");

        snippetEl.setAttribute("data-cat-slider-id", sliderTypeSelect.value);

        // Replace snippet content
        snippetEl.innerHTML = `
            <div class="container">
                <div class="block-title">
                    <h3 class="fancy">${_t(type)}</h3>
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
class CategorySliderPlugin extends Plugin {
    static id = "categorySliderSnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".cat_slider_3"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("cat_slider_3")) {
            return;
        }
        snippetEl.classList.remove("o_hidden");
        snippetEl.innerHTML = "";

        // open modal once after drop
        openCategorySliderModal(snippetEl);
    }
}
registry.category("website-plugins").add(
    CategorySliderPlugin.id,
    CategorySliderPlugin
);

// ------------------------------------------------------
// Modify Button Action
// ------------------------------------------------------
export class CategorySliderModifyBtnAction extends BuilderAction {
    static id = "cat_slider1_modifyBtn";

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
class CategorySliderModifyPlugin extends Plugin {
    static id = "CategorySliderModifyPlugin";
    static dependencies = [];
    selector = ".cat_slider_3";

    resources = {
        builder_options: {
            template: "theme_scita_category_slider_3_option",
            selector: ".cat_slider_3",
        },
        so_content_addition_selector: [".cat_slider_3"],
        builder_actions: {
            CategorySliderModifyBtnAction,
        },
    };
}

registry.category("website-plugins").add(
    CategorySliderModifyPlugin.id,
    CategorySliderModifyPlugin
);
