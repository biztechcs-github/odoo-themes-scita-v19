/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { renderToElement } from "@web/core/utils/render";
import { BuilderAction } from "@html_builder/core/builder_action";

// -------------------------------------------------
// Shared Modal Logic
// -------------------------------------------------
async function openDealOfDayBanner3Modal(snippetEl) {
    // Render modal template (custom template without Deals dropdown)
    const modalEl = renderToElement("theme_scita.deal_of_day_banner_5_configration");
    document.body.appendChild(modalEl);

    // Bootstrap modal
    const myModal = new Modal(modalEl);
    myModal.show();

    const dateInput = modalEl.querySelector("input#date");
    const hourInput = modalEl.querySelector("input#hours");
    const minInput = modalEl.querySelector("input#minutes");
    const secInput = modalEl.querySelector("input#second");
    const msgInput = modalEl.querySelector("input#sale_over");
    const submitBtn = modalEl.querySelector("#snippnet_submit");
    const cancelBtn = modalEl.querySelector("#cancel");

    // Prefill values if snippet already configured
    const timerEl = snippetEl.querySelector('.js_counter_timer');
    
    // Get data from timer element if available
    if (timerEl && timerEl.dataset.date && timerEl.dataset.date !== "nan") {
        // Parse the stored date format: "Jan 1,2025 12:30:45"
        try {
            const storedDate = new Date(timerEl.dataset.date);
            if (!isNaN(storedDate.getTime())) {
                const year = storedDate.getFullYear();
                const month = String(storedDate.getMonth() + 1).padStart(2, '0');
                const day = String(storedDate.getDate()).padStart(2, '0');
                dateInput.value = `${year}-${month}-${day}`;
                hourInput.value = storedDate.getHours();
                minInput.value = storedDate.getMinutes();
                secInput.value = storedDate.getSeconds();
            }
        } catch (e) {
            console.error("Error parsing date:", e);
        }
    }
    
    if (timerEl && timerEl.dataset.msg) {
        msgInput.value = timerEl.dataset.msg;
    }

    // Handle submit
    submitBtn.addEventListener("click", () => {
        const date = new Date(dateInput.value);
        const hours = parseInt(hourInput.value) || 0;
        const mins = parseInt(minInput.value) || 0;
        const secs = parseInt(secInput.value) || 0;

        // Find the timer element
        const timerElement = snippetEl.querySelector('.js_counter_timer');

        if (isNaN(date.getTime())) {
            alert(_t("Invalid Time Format. Please enter correct format of Time"));
            if (timerElement) {
                timerElement.setAttribute("data-date", "nan");
                timerElement.setAttribute("data-msg", msgInput.value);
            }
        } else {
            const monthShortNames = [
                "Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"
            ];
            const formatted = `${monthShortNames[date.getMonth()]} ${date.getDate()},${date.getFullYear()} ${hours}:${mins}:${secs}`;
            
            if (timerElement) {
                timerElement.setAttribute("data-date", formatted);
                timerElement.setAttribute("data-msg", msgInput.value);
                
                // Build timer HTML for preview in editor
                const timerHTML = `
                    <div class='counter_timer_div'>
                        <span class='col-lg-3 col-md-3 col-sm-3 col-3 text-center timer_col'>
                            <div class='box_degit'>
                                <span id='days' class='d-count t_days_hr_min_sec_digit o_default_snippet_text'>00</span>
                                <span id='day_lbl' class='d-block'>DAYS</span>
                            </div>
                        </span>
                        <span class='col-lg-3 col-md-3 col-sm-3 col-3 text-center timer_col'>
                            <div class='box_degit'>
                                <span id='hours' class='d-count t_days_hr_min_sec_digit o_default_snippet_text'>${String(hours).padStart(2, '0')}</span>
                                <span id='h_lbl' class='d-block'>HOURS</span>
                            </div>
                        </span>
                        <span class='col-lg-3 col-md-3 col-sm-3 col-3 text-center timer_col'>
                            <div class='box_degit'>
                                <span id='minutes' class='d-count t_days_hr_min_sec_digit o_default_snippet_text'>${String(mins).padStart(2, '0')}</span>
                                <span id='m_lbl' class='d-block'>MINS</span>
                            </div>
                        </span>
                        <span class='col-lg-3 col-md-3 col-sm-3 col-3 text-center timer_col'>
                            <div class='box_degit'>
                                <span id='seconds' class='d-count t_days_hr_min_sec_digit o_default_snippet_text'>${String(secs).padStart(2, '0')}</span>
                                <span id='s_lbl' class='d-block'>SECS</span>
                            </div>
                        </span>
                    </div>
                `;
                timerElement.innerHTML = timerHTML;
            }
        }

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
class DealOfDayBanner3SnippetPlugin extends Plugin {
    static id = "dealOfDayBanner3Snippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".deal_of_day_banner_3"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("deal_of_day_banner_3")) {
            return;
        }

        // open modal after drop
        await openDealOfDayBanner3Modal(snippetEl);
    }
}
registry.category("website-plugins").add(
    DealOfDayBanner3SnippetPlugin.id,
    DealOfDayBanner3SnippetPlugin
);

// -------------------------------------------------
// Modify Button Action (Commented out - can be added later if needed)
// -------------------------------------------------
// export class DealOfDayBanner3ModifyBtnAction extends BuilderAction {
//     static id = "dealOfDayBanner3ModifyBtn";

//     apply({ editingElement, params: { mainParam } }) {
//         if (mainParam === "open") {
//             openDealOfDayBanner3Modal(editingElement);
//         }
//     }

//     isApplied() {
//         return false; // always allow reopen
//     }
// }

// Register modify plugin
// class DealOfDayBanner3ModifyPlugin extends Plugin {
//     static id = "dealOfDayBanner3ModifyPlugin";
//     static dependencies = ["history", "media"];
//     selector = ".deal_of_day_banner_3";

//     resources = {
//         builder_options: {
//             template: "theme_scita_deal_of_day_banner_3_option",
//             selector: ".deal_of_day_banner_3",
//         },
//         so_content_addition_selector: [".deal_of_day_banner_3"],
//         builder_actions: {
//             DealOfDayBanner3ModifyBtnAction,
//         },
//     };
// }
// registry.category("website-plugins").add(
//     DealOfDayBanner3ModifyPlugin.id,
//     DealOfDayBanner3ModifyPlugin
// );

