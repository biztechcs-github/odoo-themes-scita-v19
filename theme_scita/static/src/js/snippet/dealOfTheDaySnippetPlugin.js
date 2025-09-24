/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { rpc } from "@web/core/network/rpc";
import { renderToElement } from "@web/core/utils/render";
import { BuilderAction } from "@html_builder/core/builder_action";

// -------------------------------------------------
// Shared Modal Logic
// -------------------------------------------------
async function openDealOfTheDayModal(snippetEl) {
    // Render modal template
    const modalEl = renderToElement("theme_scita.deal_of_the_day_configration");
    document.body.appendChild(modalEl);

    // Bootstrap modal
    const myModal = new Modal(modalEl);
    myModal.show();

    const selectEl = modalEl.querySelector("#slider_deals_select");
    const dateInput = modalEl.querySelector("input#date");
    const hourInput = modalEl.querySelector("input#hours");
    const minInput = modalEl.querySelector("input#minutes");
    const secInput = modalEl.querySelector("input#second");
    const msgInput = modalEl.querySelector("input#sale_over");
    const submitBtn = modalEl.querySelector("#snippnet_submit");
    const cancelBtn = modalEl.querySelector("#cancel");

    // Prefill values if snippet already configured
    if (snippetEl.dataset.dealSnippetId) {
        selectEl.value = snippetEl.dataset.dealSnippetId;
    }
    if (snippetEl.dataset.date) {
        dateInput.value = snippetEl.dataset.date;
    }
    if (snippetEl.dataset.msg) {
        msgInput.value = snippetEl.dataset.msg;
    }

    // Populate dropdown from RPC
    const res = await rpc("/theme_scita/deal_get_options", {});
    selectEl.innerHTML = "";
    res.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.id;
        option.textContent = opt.name;
        selectEl.appendChild(option);
    });

    // Handle submit
    submitBtn.addEventListener("click", () => {
        const date = new Date(dateInput.value);
        const hours = parseInt(hourInput.value) || 0;
        const mins = parseInt(minInput.value) || 0;
        const secs = parseInt(secInput.value) || 0;

        if (isNaN(date.getTime())) {
            alert(_t("Invalid Time Format. Please enter correct format of Time"));
            snippetEl.setAttribute("data-date", "nan");
            snippetEl.setAttribute("data-msg", msgInput.value);
        } else {
            const monthShortNames = [
                "Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"
            ];
            const formatted = `${monthShortNames[date.getMonth()]} ${date.getDate()},${date.getFullYear()} ${hours}:${mins}:${secs}`;
            snippetEl.setAttribute("data-date", formatted);
            snippetEl.setAttribute("data-msg", msgInput.value);
        }

        snippetEl.setAttribute("data-deal-snippet-id", selectEl.value);

        const type = selectEl.selectedOptions[0]?.text || _t("Deal Of The Day");

        snippetEl.innerHTML = `
            <div class="container">
                <div class="row our-categories">
                    <div class="col-md-12">
                        <div class="title-block">
                            <h4 class="section-title style1">
                                <span>${type}</span>
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

// -------------------------------------------------
// Snippet Drop Plugin
// -------------------------------------------------
class DealOfTheDaySnippetPlugin extends Plugin {
    static id = "dealOfTheDaySnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".oe_deal_of_the_day"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("oe_deal_of_the_day")) {
            return;
        }

        snippetEl.classList.remove("hidden");
        snippetEl.innerHTML = "";

        // open modal after drop
        openDealOfTheDayModal(snippetEl);
    }
}
registry.category("website-plugins").add(
    DealOfTheDaySnippetPlugin.id,
    DealOfTheDaySnippetPlugin
);

// -------------------------------------------------
// Modify Button Action
// -------------------------------------------------
export class DealOfTheDayModifyBtnAction extends BuilderAction {
    static id = "dealOfTheDayModifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openDealOfTheDayModal(editingElement);
        }
    }

    isApplied() {
        return false; // always allow reopen
    }
}

// Register modify plugin
class DealOfTheDayModifyPlugin extends Plugin {
    static id = "dealOfTheDayModifyPlugin";
    static dependencies = ["history", "media"];
    selector = ".oe_deal_of_the_day";

    resources = {
        builder_options: {
            template: "theme_scita_deal_of_the_day_option",
            selector: ".oe_deal_of_the_day",
        },
        so_content_addition_selector: [".oe_deal_of_the_day"],
        builder_actions: {
            DealOfTheDayModifyBtnAction,
        },
    };
}
registry.category("website-plugins").add(
    DealOfTheDayModifyPlugin.id,
    DealOfTheDayModifyPlugin
);
