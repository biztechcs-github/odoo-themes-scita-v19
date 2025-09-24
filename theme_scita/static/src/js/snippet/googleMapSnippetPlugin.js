/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { renderToElement } from "@web/core/utils/render";
import { BuilderAction } from "@html_builder/core/builder_action";

// ------------------------------------------------------
// Shared Modal Openers
// ------------------------------------------------------
async function openGoogleMapModal(snippetEl) {
    const modalEl = renderToElement("theme_scita.s_google_map_modal");
    document.body.appendChild(modalEl);

    const modal = new Modal(modalEl);
    modal.show();

    const setBtn = modalEl.querySelector("#set_map_data");
    const textarea = modalEl.querySelector("#address_html_code");

    setBtn.addEventListener("click", () => {
        const htmlCode = textarea.value;
        snippetEl.innerHTML = htmlCode;
        modal.hide();
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

async function openGoogleMapContentModal(snippetEl) {
    const modalEl = renderToElement("theme_scita.s_google_map_content_modal");
    document.body.appendChild(modalEl);

    const modal = new Modal(modalEl);
    modal.show();

    const setBtn = modalEl.querySelector("#set_map_data_content");
    const textarea = modalEl.querySelector("#address_content_html_code");

    setBtn.addEventListener("click", () => {
        const htmlCode = textarea.value;
        const container = snippetEl.querySelector(".map_data_container");
        if (container) {
            container.innerHTML = htmlCode;
        }
        modal.hide();
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// ------------------------------------------------------
// Drop Plugin for Google Map V1
// ------------------------------------------------------
class GoogleMapSnippetPlugin extends Plugin {
    static id = "googleMapSnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".google_map_v1"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("google_map_v1")) {
            return;
        }
        snippetEl.innerHTML = "<div class='map_container'><span>Google Map Address</span></div>";
        openGoogleMapModal(snippetEl);
    }
}
registry.category("website-plugins").add(GoogleMapSnippetPlugin.id, GoogleMapSnippetPlugin);

// ------------------------------------------------------
// Drop Plugin for Google Map V2 (with content)
// ------------------------------------------------------
class GoogleMapContentSnippetPlugin extends Plugin {
    static id = "googleMapContentSnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".google_map_v2"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("google_map_v2")) {
            return;
        }
        openGoogleMapContentModal(snippetEl);
    }
}
registry.category("website-plugins").add(GoogleMapContentSnippetPlugin.id, GoogleMapContentSnippetPlugin);

// ------------------------------------------------------
// Modify Button Actions
// ------------------------------------------------------
export class GoogleMapModifyBtnAction extends BuilderAction {
    static id = "googleMapModifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openGoogleMapModal(editingElement);
        }
    }
    isApplied() { return false; }
}

export class GoogleMapContentModifyBtnAction extends BuilderAction {
    static id = "googleMapContentModifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openGoogleMapContentModal(editingElement);
        }
    }
    isApplied() { return false; }
}

// ------------------------------------------------------
// Register Modify Plugins
// ------------------------------------------------------
class GoogleMapModifyPlugin extends Plugin {
    static id = "googleMapModifyPlugin";
    static dependencies = [];

    resources = {
        builder_options: {
            template: "s_google_map_option",
            selector: ".google_map_v1",
        },
        so_content_addition_selector: [".google_map_v1"],
        builder_actions: { GoogleMapModifyBtnAction },
    };
}
registry.category("website-plugins").add(GoogleMapModifyPlugin.id, GoogleMapModifyPlugin);

class GoogleMapContentModifyPlugin extends Plugin {
    static id = "googleMapContentModifyPlugin";
    static dependencies = [];

    resources = {
        builder_options: {
            template: "s_google_map_option_c",
            selector: ".google_map_v2",
        },
        so_content_addition_selector: [".google_map_v2"],
        builder_actions: { GoogleMapContentModifyBtnAction },
    };
}
registry.category("website-plugins").add(GoogleMapContentModifyPlugin.id, GoogleMapContentModifyPlugin);
