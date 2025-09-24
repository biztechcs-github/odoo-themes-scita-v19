// /** @odoo-module **/

// import { Plugin } from "@html_editor/plugin";
// import { registry } from "@web/core/registry";
// import { _t } from "@web/core/l10n/translation";
// import { renderToElement } from "@web/core/utils/render";
// import { BuilderAction } from "@html_builder/core/builder_action";
// import { rpc } from "@web/core/network/rpc";

// // ---------------------------------------------
// // Shared Modal Logic
// // ---------------------------------------------
// async function openBlogSliderModal(snippetEl, parentPlugin) {
//     // Render modal template
//     const modalEl = renderToElement("theme_scita.scita_blog_slider_block");
//     document.body.appendChild(modalEl);

//     // Bootstrap modal
//     const myModal = new Modal(modalEl);
//     myModal.show();

//     const sliderTypeSelect = modalEl.querySelector("#blog_slider_type");
//     const cancelBtn = modalEl.querySelector("#cancel");
//     const submitBtn = modalEl.querySelector("#blog_sub_data");

//     // Populate dropdown via RPC
//     rpc("/theme_scita/blog_get_options", {}).then((res) => {
//         // Remove old options except "0"
//         [...sliderTypeSelect.querySelectorAll("option")].forEach((opt) => {
//             if (opt.value !== "0") opt.remove();
//         });
//         res.forEach((opt) => {
//             const option = document.createElement("option");
//             option.value = opt.id;
//             option.textContent = opt.name;
//             sliderTypeSelect.appendChild(option);
//         });
//     });

//     // Submit handler
//     submitBtn?.addEventListener("click", () => {
//         const selectedOption =
//             sliderTypeSelect.options[sliderTypeSelect.selectedIndex];

//         const typeText = selectedOption
//             ? _t(selectedOption.textContent)
//             : _t("Blog Post Slider");

//         snippetEl.setAttribute("data-blog-slider-type", sliderTypeSelect.value);
//         snippetEl.setAttribute(
//             "data-blog-slider-id",
//             "blog-myowl" + sliderTypeSelect.value
//         );

//         // Replace snippet content
//         snippetEl.innerHTML = `
//             <div class="container">
//                 <div class="block-title">
//                     <h3 class="fancy">${typeText}</h3>
//                 </div>
//             </div>
//         `;
//         myModal.hide();
//     });

//     // Cancel handler → remove snippet like old behavior
//     cancelBtn?.addEventListener("click", () => {
//         myModal.hide();
//         parentPlugin?.getParent()?._onRemoveClick(new Event("click"));
//     });

//     // Cleanup
//     modalEl.addEventListener("hidden.bs.modal", () => {
//         modalEl.remove();
//     });
// }

// // ---------------------------------------------
// // Snippet Drop Plugin
// // ---------------------------------------------
// class BlogSliderSnippetPlugin extends Plugin {
//     static id = "blogSliderSnippet";
//     static dependencies = [];

//     resources = {
//         on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
//         so_content_addition_selector: [".scita_blog_slider"],
//     };

//     async onSnippetDropped({ snippetEl }) {
//         if (!snippetEl.classList.contains("scita_blog_slider")) {
//             return;
//         }

//         snippetEl.classList.remove("o_hidden");
//         snippetEl.innerHTML = "";

//         // ✅ open modal once after drop
//         openBlogSliderModal(snippetEl, this);
//     }
// }
// registry.category("website-plugins").add(
//     BlogSliderSnippetPlugin.id,
//     BlogSliderSnippetPlugin
// );

// // ---------------------------------------------
// // Modify Button Action
// // ---------------------------------------------
// export class BlogSliderModifyBtnAction extends BuilderAction {
//     static id = "blogSliderModifyBtn";

//     apply({ editingElement, params: { mainParam } }) {
//         if (mainParam === "open") {
//             openBlogSliderModal(editingElement);
//         }
//     }

//     // Always return false → so button not auto-applied
//     isApplied() {
//         return false;
//     }
// }

// // ---------------------------------------------
// // Modify Plugin
// // ---------------------------------------------
// class BlogSliderModifyPlugin extends Plugin {
//     static id = "blogSliderModifyPlugin";
//     static dependencies = ["history", "media"];
//     selector = ".scita_blog_slider";

//     resources = {
//         builder_options: {
//             template: "theme_scita_blog_slider_option", // define in XML
//             selector: ".scita_blog_slider",
//         },
//         so_content_addition_selector: [".scita_blog_slider"],
//         builder_actions: {
//             BlogSliderModifyBtnAction,
//         },
//     };
// }

// registry.category("website-plugins").add(
//     BlogSliderModifyPlugin.id,
//     BlogSliderModifyPlugin
// );


/** @odoo-module **/

import { Plugin } from "@html_editor/plugin";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { renderToElement } from "@web/core/utils/render";
import { BuilderAction } from "@html_builder/core/builder_action";
import { rpc } from "@web/core/network/rpc";

// ---------------------------------------------
// BlogSlider Modal + Plugins
// ---------------------------------------------
async function openBlogSliderModal(snippetEl, parentPlugin) {
    const modalEl = renderToElement("theme_scita.scita_blog_slider_block");
    document.body.appendChild(modalEl);

    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#blog_slider_type");
    const cancelBtn = modalEl.querySelector("#cancel");
    const submitBtn = modalEl.querySelector("#blog_sub_data");

    rpc("/theme_scita/blog_get_options", {}).then((res) => {
        [...sliderTypeSelect.querySelectorAll("option")].forEach((opt) => {
            if (opt.value !== "0") opt.remove();
        });
        res.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt.id;
            option.textContent = opt.name;
            sliderTypeSelect.appendChild(option);
        });
    });

    submitBtn?.addEventListener("click", () => {
        const selectedOption =
            sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const typeText = selectedOption
            ? _t(selectedOption.textContent)
            : _t("Blog Post Slider");

        snippetEl.setAttribute("data-blog-slider-type", sliderTypeSelect.value);
        snippetEl.setAttribute(
            "data-blog-slider-id",
            "blog-myowl" + sliderTypeSelect.value
        );
        snippetEl.innerHTML = `
            <div class="container">
                <div class="block-title">
                    <h3 class="fancy">${typeText}</h3>
                </div>
            </div>
        `;
        myModal.hide();
    });

    cancelBtn?.addEventListener("click", () => {
        myModal.hide();
        parentPlugin?.getParent()?._onRemoveClick(new Event("click"));
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

class BlogSliderSnippetPlugin extends Plugin {
    static id = "blogSliderSnippet";
    static dependencies = [];
    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".scita_blog_slider"],
    };
    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("scita_blog_slider")) return;
        snippetEl.classList.remove("o_hidden");
        snippetEl.innerHTML = "";
        openBlogSliderModal(snippetEl, this);
    }
}
registry.category("website-plugins").add(
    BlogSliderSnippetPlugin.id,
    BlogSliderSnippetPlugin
);

export class BlogSliderModifyBtnAction extends BuilderAction {
    static id = "blogSliderModifyBtn";
    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") openBlogSliderModal(editingElement);
    }
    isApplied() {
        return false;
    }
}

class BlogSliderModifyPlugin extends Plugin {
    static id = "blogSliderModifyPlugin";
    static dependencies = ["history", "media"];
    selector = ".scita_blog_slider";
    resources = {
        builder_options: {
            template: "theme_scita_blog_slider_option",
            selector: ".scita_blog_slider",
        },
        so_content_addition_selector: [".scita_blog_slider"],
        builder_actions: {
            BlogSliderModifyBtnAction,
        },
    };
}
registry.category("website-plugins").add(
    BlogSliderModifyPlugin.id,
    BlogSliderModifyPlugin
);

// ---------------------------------------------
// Blog4Custom Modal + Plugins
// ---------------------------------------------
async function openBlog4CustomModal(snippetEl, parentPlugin) {
    const modalEl = renderToElement("theme_scita.scita_blog_slider_block");
    document.body.appendChild(modalEl);

    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#blog_slider_type");
    const cancelBtn = modalEl.querySelector("#cancel");
    const submitBtn = modalEl.querySelector("#blog_sub_data");

    rpc("/theme_scita/blog_get_options", {}).then((res) => {
        [...sliderTypeSelect.querySelectorAll("option")].forEach((opt) => {
            if (opt.value !== "0") opt.remove();
        });
        res.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt.id;
            option.textContent = opt.name;
            sliderTypeSelect.appendChild(option);
        });
    });

    submitBtn?.addEventListener("click", () => {
        const selectedOption =
            sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const typeText = selectedOption
            ? _t(selectedOption.textContent)
            : _t("Blog Post Slider");

        snippetEl.setAttribute("data-blog-slider-type", sliderTypeSelect.value);
        snippetEl.setAttribute(
            "data-blog-slider-id",
            "blog-myowl" + sliderTypeSelect.value
        );
        snippetEl.innerHTML = `
            <div class="container">
                <div class="block-title">
                    <h3 class="fancy">${typeText}</h3>
                </div>
            </div>
        `;
        myModal.hide();
    });

    cancelBtn?.addEventListener("click", () => {
        myModal.hide();
        parentPlugin?.getParent()?._onRemoveClick(new Event("click"));
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

class Blog4CustomSnippetPlugin extends Plugin {
    static id = "blog4CustomSnippet";
    static dependencies = [];
    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".blog_4_custom"],
    };
    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("blog_4_custom")) return;
        snippetEl.classList.remove("o_hidden");
        snippetEl.innerHTML = "";
        openBlog4CustomModal(snippetEl, this);
    }
}
registry.category("website-plugins").add(
    Blog4CustomSnippetPlugin.id,
    Blog4CustomSnippetPlugin
);

export class Blog4CustomModifyBtnAction extends BuilderAction {
    static id = "blog4CustomModifyBtn";
    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") openBlog4CustomModal(editingElement);
    }
    isApplied() {
        return false;
    }
}

class Blog4CustomModifyPlugin extends Plugin {
    static id = "blog4CustomModifyPlugin";
    static dependencies = ["history", "media"];
    selector = ".blog_4_custom";
    resources = {
        builder_options: {
            template: "blog_4_custom_snippet_option",
            selector: ".blog_4_custom",
        },
        so_content_addition_selector: [".blog_4_custom"],
        builder_actions: {
            Blog4CustomModifyBtnAction,
        },
    };
}
registry.category("website-plugins").add(
    Blog4CustomModifyPlugin.id,
    Blog4CustomModifyPlugin
);

// ---------------------------------------------
// Blog2Custom Modal + Plugins
// ---------------------------------------------
async function openBlog2CustomModal(snippetEl, parentPlugin) {
    const modalEl = renderToElement("theme_scita.scita_blog_slider_block");
    document.body.appendChild(modalEl);

    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#blog_slider_type");
    const cancelBtn = modalEl.querySelector("#cancel");
    const submitBtn = modalEl.querySelector("#blog_sub_data");

    rpc("/theme_scita/blog_get_options", {}).then((res) => {
        [...sliderTypeSelect.querySelectorAll("option")].forEach((opt) => {
            if (opt.value !== "0") opt.remove();
        });
        res.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt.id;
            option.textContent = opt.name;
            sliderTypeSelect.appendChild(option);
        });
    });

    submitBtn?.addEventListener("click", () => {
        const selectedOption =
            sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const typeText = selectedOption
            ? _t(selectedOption.textContent)
            : _t("Blog Post Slider");

        snippetEl.setAttribute("data-blog-slider-type", sliderTypeSelect.value);
        snippetEl.setAttribute(
            "data-blog-slider-id",
            "blog-myowl" + sliderTypeSelect.value
        );
        snippetEl.innerHTML = `
            <div class="container">
                <div class="block-title">
                    <h3 class="fancy">${typeText}</h3>
                </div>
            </div>
        `;
        myModal.hide();
    });

    cancelBtn?.addEventListener("click", () => {
        myModal.hide();
        parentPlugin?.getParent()?._onRemoveClick(new Event("click"));
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

class Blog2CustomSnippetPlugin extends Plugin {
    static id = "blog2CustomSnippet";
    static dependencies = [];
    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".blog_2_custom"],
    };
    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("blog_2_custom")) return;
        snippetEl.classList.remove("o_hidden");
        snippetEl.innerHTML = "";
        openBlog2CustomModal(snippetEl, this);
    }
}
registry.category("website-plugins").add(
    Blog2CustomSnippetPlugin.id,
    Blog2CustomSnippetPlugin
);

export class Blog2CustomModifyBtnAction extends BuilderAction {
    static id = "blog2CustomModifyBtn";
    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") openBlog2CustomModal(editingElement);
    }
    isApplied() {
        return false;
    }
}

class Blog2CustomModifyPlugin extends Plugin {
    static id = "blog2CustomModifyPlugin";
    static dependencies = ["history", "media"];
    selector = ".blog_2_custom";
    resources = {
        builder_options: {
            template: "blog_2_custom_snippet_option",
            selector: ".blog_2_custom",
        },
        so_content_addition_selector: [".blog_2_custom"],
        builder_actions: {
            Blog2CustomModifyBtnAction,
        },
    };
}
registry.category("website-plugins").add(
    Blog2CustomModifyPlugin.id,
    Blog2CustomModifyPlugin
);

// ---------------------------------------------
// Blog5Custom Modal + Plugins
// ---------------------------------------------
async function openBlog5CustomModal(snippetEl, parentPlugin) {
    const modalEl = renderToElement("theme_scita.scita_blog_slider_block");
    document.body.appendChild(modalEl);

    const myModal = new Modal(modalEl);
    myModal.show();

    const sliderTypeSelect = modalEl.querySelector("#blog_slider_type");
    const cancelBtn = modalEl.querySelector("#cancel");
    const submitBtn = modalEl.querySelector("#blog_sub_data");

    rpc("/theme_scita/blog_get_options", {}).then((res) => {
        [...sliderTypeSelect.querySelectorAll("option")].forEach((opt) => {
            if (opt.value !== "0") opt.remove();
        });
        res.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt.id;
            option.textContent = opt.name;
            sliderTypeSelect.appendChild(option);
        });
    });

    submitBtn?.addEventListener("click", () => {
        const selectedOption =
            sliderTypeSelect.options[sliderTypeSelect.selectedIndex];
        const typeText = selectedOption
            ? _t(selectedOption.textContent)
            : _t("Blog Post Slider");

        snippetEl.setAttribute("data-blog-slider-type", sliderTypeSelect.value);
        snippetEl.setAttribute(
            "data-blog-slider-id",
            "blog-myowl" + sliderTypeSelect.value
        );
        snippetEl.innerHTML = `
            <div class="container">
                <div class="block-title">
                    <h3 class="fancy">${typeText}</h3>
                </div>
            </div>
        `;
        myModal.hide();
    });

    cancelBtn?.addEventListener("click", () => {
        myModal.hide();
        parentPlugin?.getParent()?._onRemoveClick(new Event("click"));
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        modalEl.remove();
    });
}

class Blog5CustomSnippetPlugin extends Plugin {
    static id = "blog5CustomSnippet";
    static dependencies = [];
    resources = {
        on_snippet_dropped_handlers: this.onSnippetDropped.bind(this),
        so_content_addition_selector: [".blog_5_custom"],
    };
    async onSnippetDropped({ snippetEl }) {
        if (!snippetEl.classList.contains("blog_5_custom")) return;
        snippetEl.classList.remove("o_hidden");
        snippetEl.innerHTML = "";
        openBlog5CustomModal(snippetEl, this);
    }
}
registry.category("website-plugins").add(
    Blog5CustomSnippetPlugin.id,
    Blog5CustomSnippetPlugin
);

export class Blog5CustomModifyBtnAction extends BuilderAction {
    static id = "blog5CustomModifyBtn";
    apply({ editingElement, params: { mainParam } }) {
        if (mainParam === "open") openBlog5CustomModal(editingElement);
    }
    isApplied() {
        return false;
    }
}

class Blog5CustomModifyPlugin extends Plugin {
    static id = "blog5CustomModifyPlugin";
    static dependencies = ["history", "media"];
    selector = ".blog_5_custom";
    resources = {
        builder_options: {
            template: "blog_5_custom_snippet_option",
            selector: ".blog_5_custom",
        },
        so_content_addition_selector: [".blog_5_custom"],
        builder_actions: {
            Blog5CustomModifyBtnAction,
        },
    };
}
registry.category("website-plugins").add(
    Blog5CustomModifyPlugin.id,
    Blog5CustomModifyPlugin
);
