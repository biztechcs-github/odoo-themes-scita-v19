/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { renderToElement } from "@web/core/utils/render";
import { BuilderAction } from "@html_builder/core/builder_action";

// ---------------------------------------------
// Shared Modal Logic
// ---------------------------------------------
async function openVideoBannerModal(snippetEl) {
    // Render modal template
    const modalEl = renderToElement("theme_scita.video_banner_block");
    document.body.appendChild(modalEl);

    // Bootstrap modal
    const myModal = new Modal(modalEl);
    myModal.show();

    const videoUrlInput = modalEl.querySelector("#video-url");
    const cancelBtn = modalEl.querySelector("#cancel");
    const submitBtn = modalEl.querySelector("#video_sub_data");

    // Pre-fill from snippet
    videoUrlInput.value = snippetEl.getAttribute("data-video-url") || "";

    // Submit handler
    submitBtn.addEventListener("click", () => {
        const videoUrl = videoUrlInput.value;
        snippetEl.setAttribute("data-video-url", videoUrl);

        // Use the original placeholder template structure to maintain consistency
        snippetEl.innerHTML = `
            <div class="container">
                <div class="row sct-video-row">
                    <div class="col-md-12">
                        <h3 class="section-title style1" id="snippet-title">
                            <span>${_t("Video Banner")}</span>
                        </h3>
                        <div class="category-slider-placeholder">
                            <img src="/theme_scita/static/src/img/scita-placeholder.png" alt="Video Banner" class="img-fluid"/>
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

    // Cleanup
    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

// ---------------------------------------------
// Snippet Drop Plugin
// ---------------------------------------------
class VideoBannerSnippetPlugin extends Plugin {
    static id = "videoBannerSnippet";
    static dependencies = [];

    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".dynamic_video_banner"],
    };

    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("dynamic_video_banner")) {
            return;
        }

        snippetEl.classList.remove("hidden");
        snippetEl.innerHTML = "";

        // ✅ open modal once after drop
        openVideoBannerModal(snippetEl);
    }
}
registry.category("website-plugins").add(
    VideoBannerSnippetPlugin.id,
    VideoBannerSnippetPlugin
);

// ---------------------------------------------
// Modify Button Action
// ---------------------------------------------
export class VideoBannerModifyBtnAction extends BuilderAction {
    static id = "videoBannerModifyBtn";

    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") {
            openVideoBannerModal(editingElement);
        }
    }

    // Always return false → so button not auto-applied
    isApplied() {
        return false;
    }
}

// Register plugin for Modify button
class VideoBannerModifyPlugin extends Plugin {
    static id = "videoBannerModifyPlugin";
    static dependencies = ["history", "media"];
    selector = ".dynamic_video_banner";

    resources = {
        builder_options: {
            template: "dynamic_video_banner",
            selector: ".dynamic_video_banner",
        },
        so_content_addition_selector: [".dynamic_video_banner"],
        builder_actions: {
            VideoBannerModifyBtnAction,
        },
    };
}

registry.category("website-plugins").add(
    VideoBannerModifyPlugin.id,
    VideoBannerModifyPlugin
);
