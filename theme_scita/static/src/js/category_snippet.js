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
    const cancelBtn = modalEl.querySelector("#cancel");
    const submitBtn = modalEl.querySelector("#cat_sub_data");

    // Fetch slider types from controller
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
    submitBtn?.addEventListener("click", () => {
        const selectedOpt = sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const type = selectedOpt ? selectedOpt.text : _t("Category Slider");

        // Save on snippet element
        snippetEl.setAttribute("data-cat-slider-id", sliderTypeSelect.value);

        // Replace content
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

    // Cleanup modal
    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// ------------------------------------------------------
// Snippet Drop Plugin
// ------------------------------------------------------
class CategorySnippetPlugin extends Plugin {
    static id = "categorySnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".oe_cat_slider"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("oe_cat_slider")) {
            return;
        }
        snippetEl.classList.remove("o_hidden");
        snippetEl.innerHTML = "";

        // open modal once after drop
        openCategorySliderModal(snippetEl);
    }
}
registry.category("website-plugins").add(
    CategorySnippetPlugin.id,
    CategorySnippetPlugin
);

// ------------------------------------------------------
// Modify Button Action
// ------------------------------------------------------
export class CategorySnippetModifyBtnAction extends BuilderAction {
    static id = "category_snippet_modifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openCategorySliderModal(editingElement);
        }
    }

    isApplied() {
        return false;
    }
}

// ------------------------------------------------------
// Register Modify Button Plugin
// ------------------------------------------------------
class CategorySnippetModifyPlugin extends Plugin {
    static id = "categorySnippetModifyPlugin";
    static dependencies = [];
    selector = ".oe_cat_slider";

    resources = {
        builder_options: {
            template: "theme_scita_category_slider_option", 
            selector: ".oe_cat_slider",
        },
        so_content_addition_selector: [".oe_cat_slider"],
        builder_actions: {
            CategorySnippetModifyBtnAction,
        },
    };
}

registry.category("website-plugins").add(
    CategorySnippetModifyPlugin.id,
    CategorySnippetModifyPlugin
);
