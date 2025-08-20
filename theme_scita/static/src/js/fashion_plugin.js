import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";

class FashionMultiCatCustomSnippetPlugin extends Plugin {
    static id = "fashionMultiCatCustomSnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".fashion_multi_category_slider"],
    };

    async onSnippetDropped({ snippetEl }) {
        // Remove hidden class, clear existing content
        if (!snippetEl.classList.contains("fashion_multi_category_slider")) {
            return; // exit for other snippets
        }

        snippetEl.classList.remove("hidden");
        snippetEl.querySelector(".owl-carousel")?.replaceChildren();

        // Open modal logic
        this.openMultiCategorySliderModal(snippetEl);
    }

    async openMultiCategorySliderModal(snippetEl) {
        // Render the modal template
        const modalEl = renderToElement("theme_scita.multi_product_custom_slider_block");
        document.body.appendChild(modalEl);

        // Show modal using Bootstrap's JS API
        const myModal = new Modal(modalEl);
        myModal.show();

        const sliderTypeSelect = modalEl.querySelector("#slider_type");
        const submitBtn = modalEl.querySelector("#snippnet_submit");
        const cancelBtn = modalEl.querySelector("#cancel");

        // Fetch select options
        const res = await rpc("/theme_scita/product_multi_get_options", {});
        sliderTypeSelect.innerHTML = "";
        res.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt.id;
            option.textContent = opt.name;
            sliderTypeSelect.appendChild(option);
        });

        // Handle submit click
        submitBtn.addEventListener("click", () => {
            const selectedOption =
                sliderTypeSelect.selectedOptions[0]?.text || _t("Multi Product Slider");

            snippetEl.setAttribute("data-multi-cat-slider-type", sliderTypeSelect.value);
            snippetEl.setAttribute("data-multi-cat-slider-id", `multi-cat-myowl${sliderTypeSelect.value}`);
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

        // Handle cancel click
        cancelBtn?.addEventListener("click", () => {
            myModal.hide();
        });

        // Cleanup modal DOM after it's hidden
        modalEl.addEventListener("hidden.bs.modal", () => {
            modalEl.remove();
        });
    }
}

registry.category("website-plugins").add(
    FashionMultiCatCustomSnippetPlugin.id,
    FashionMultiCatCustomSnippetPlugin
);
