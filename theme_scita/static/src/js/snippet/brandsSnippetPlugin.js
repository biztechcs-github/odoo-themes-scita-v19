// /** @odoo-module **/

// import { Plugin } from "@html_editor/plugin";
// import { registry } from "@web/core/registry";
// import { _t } from "@web/core/l10n/translation";
// import { rpc } from "@web/core/network/rpc";
// import { renderToElement } from "@web/core/utils/render";
// import { BuilderAction } from "@html_builder/core/builder_action";

// // ---------------------------------------------
// // Shared Modal Logic
// // ---------------------------------------------
// async function openBrandSliderModal(snippetEl) {
//     // Render modal
//     const modalEl = renderToElement("theme_scita.scita_brand_configration");
//     document.body.appendChild(modalEl);

//     // Show Bootstrap modal
//     const myModal = new Modal(modalEl);
//     myModal.show();

//     const sliderTypeSelect = modalEl.querySelector("#slider_type");
//     const submitBtn = modalEl.querySelector("#pro_brand_sub_data");
//     const cancelBtn = modalEl.querySelector("#cancel");

//     // Fetch brand options
//     const res = await rpc("/theme_scita/brand_get_options", {});
//     sliderTypeSelect.innerHTML = "";
//     res.forEach(opt => {
//         const option = document.createElement("option");
//         option.value = opt.id;
//         option.textContent = opt.name;
//         sliderTypeSelect.appendChild(option);
//     });

//     // Handle submit
//     submitBtn.addEventListener("click", () => {
//         const selectedOption =
//             sliderTypeSelect.selectedOptions[0]?.text || _t("Our Brands");

//         snippetEl.setAttribute("data-brand-config-type", sliderTypeSelect.value);
//         snippetEl.setAttribute("data-brand-config-id", sliderTypeSelect.value);

//         snippetEl.innerHTML = `
//             <div class="container">
//                 <div class="row oe_our_slider">
//                     <div class="col-md-12">
//                         <div class="title-block">
//                             <h4 class="section-title style1">
//                                 <span>${_t(selectedOption)}</span>
//                             </h4>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;

//         myModal.hide();
//     });

//     // Handle cancel
//     cancelBtn?.addEventListener("click", () => {
//         myModal.hide();
//     });

//     // Cleanup modal after close
//     modalEl.addEventListener("hidden.bs.modal", () => {
//         modalEl.remove();
//     });
// }

// // ---------------------------------------------
// // Snippet Drop Plugin
// // ---------------------------------------------
// class ItProdBrandsSnippetPlugin extends Plugin {
//     static id = "itProdBrandsSnippet";
//     static dependencies = [];

//     resources = {
//         on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
//         so_content_addition_selector: [".it_brand_slider"],
//     };

//     async onSnippetDropped({ snippetEl }) {
//         if (!snippetEl.classList.contains("it_brand_slider")) {
//             return;
//         }

//         snippetEl.classList.remove("o_hidden");
//         snippetEl.querySelector(".owl-carousel")?.replaceChildren();

//         // Open modal when dropped
//         openBrandSliderModal(snippetEl);
//     }
// }

// registry.category("website-plugins").add(
//     ItProdBrandsSnippetPlugin.id,
//     ItProdBrandsSnippetPlugin
// );

// // ---------------------------------------------
// // Modify Button Plugin
// // ---------------------------------------------
// class ItProdBrandsModifyPlugin extends Plugin {
//     static id = "itProdBrandsModifySnippet";
//     static dependencies = ["history", "media"];
//     selector = ".it_brand_slider";

//     resources = {
//         builder_options: {
//             template: "it_brand_option",
//             selector: ".it_brand_slider",
//         },
//         so_content_addition_selector: [".it_brand_slider"],
//         builder_actions: {
//             ModifyBtnAction,
//         },
//     };
// }

// export class ModifyBtnAction extends BuilderAction {
//     static id = "itBrandModifyBtn";

//     apply({ editingElement, params: { mainParam } }) {
//         if (mainParam === "open") {
//             // Open brand modal on Modify
//             openBrandSliderModal(editingElement);
//         }
//     }

//     isApplied({ editingElement }) {
//         return editingElement.dataset.modified === "true";
//     }
// }

// registry.category("website-plugins").add(
//     ItProdBrandsModifyPlugin.id,
//     ItProdBrandsModifyPlugin
// );

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
async function openBrandSliderModal(snippetEl, { template, defaultLabel }) {
    // Render modal
    const modalEl = renderToElement(template);
    document.body.appendChild(modalEl);

    // Show Bootstrap modal
    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#slider_type");
    const submitBtn = modalEl.querySelector("#pro_brand_sub_data");
    const cancelBtn = modalEl.querySelector("#cancel");

    // Fetch options
    const res = await rpc("/theme_scita/brand_get_options", {});
    sliderTypeSelect.innerHTML = "";
    res.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.id;
        option.textContent = opt.name;
        sliderTypeSelect.appendChild(option);
    });

    // Pre-fill if already configured
    if (snippetEl.dataset.brandConfigId) {
        sliderTypeSelect.value = snippetEl.dataset.brandConfigId;
    }

    // Handle submit
    submitBtn.addEventListener("click", () => {
        const selectedOption =
            sliderTypeSelect.selectedOptions[0]?.text || _t(defaultLabel);

        snippetEl.setAttribute("data-brand-config-type", sliderTypeSelect.value);
        snippetEl.setAttribute("data-brand-config-id", sliderTypeSelect.value);

        snippetEl.innerHTML = `
            <div class="container">
                <div class="row oe_our_slider">
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
// Generic Snippet Plugin Factory
// ---------------------------------------------
function makeSnippetPlugins({
    id,
    selector,
    optionTemplate,
    dropClass,
    defaultLabel,
    modalTemplate,
    actionId,
}) {
    class SnippetPlugin extends Plugin {
        static id = id;
        static dependencies = [];

        resources = {
            on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
            so_content_addition_selector: [selector],
        };

        async onSnippetDropped({ snippetEl }) {
            if (!snippetEl.classList.contains(dropClass)) return;

            snippetEl.classList.remove("hidden", "o_hidden");
            snippetEl.querySelector(".owl-carousel")?.replaceChildren();

            openBrandSliderModal(snippetEl, {
                template: modalTemplate,
                defaultLabel,
            });
        }
    }

    class ModifyPlugin extends Plugin {
        static id = `${id}Modify`;
        static dependencies = ["history", "media"];
        selector = selector;

        resources = {
            builder_options: {
                template: optionTemplate,
                selector: selector,
            },
            so_content_addition_selector: [selector],
            builder_actions: {
                [actionId]: ModifyBtnAction,
            },
        };
    }

    class ModifyBtnAction extends BuilderAction {
        static id = actionId;

        apply({ editingElement, params: { mainParam } }) {
            if (mainParam === "open") {
                openBrandSliderModal(editingElement, {
                    template: modalTemplate,
                    defaultLabel,
                });
            }
        }

        isApplied() {
            return false; // Always reopen modal
        }
    }

    registry.category("website-plugins").add(SnippetPlugin.id, SnippetPlugin);
    registry.category("website-plugins").add(ModifyPlugin.id, ModifyPlugin);
}

// ---------------------------------------------
// Register Both Variants
// ---------------------------------------------
makeSnippetPlugins({
    id: "brandSliderSnippet",
    selector: ".box_brand_slider",
    optionTemplate: "brands_box_option",
    dropClass: "box_brand_slider",
    defaultLabel: "Brand Snippet",
    modalTemplate: "theme_scita.scita_brand_configration",
    actionId: "brandSliderModifyBtn",
});

makeSnippetPlugins({
    id: "itProdBrandsSnippet",
    selector: ".it_brand_slider",
    optionTemplate: "it_brand_option",
    dropClass: "it_brand_slider",
    defaultLabel: "Our Brands",
    modalTemplate: "theme_scita.scita_brand_configration",
    actionId: "itBrandModifyBtn",
});
