/** @odoo-module **/

import { BlockTab } from "@html_builder/sidebar/block_tab";
import { patch } from "@web/core/utils/patch";

// Patch the BlockTab component to properly organize Theme Scita hierarchical snippets
patch(BlockTab.prototype, {
    setup() {
        super.setup(...arguments);
        
        // Organize snippets into Theme Scita groups
        this._organizeScitaSnippets();
    },
    
    /**
     * Organize Theme Scita snippets into hierarchical groups
     * This creates a structure similar to Odoo's native snippet groups with parent-child relationships
     */
    _organizeScitaSnippets() {
        if (!this.snippetModel) {
            console.warn('Snippet model not available');
            return;
        }

        // Define Theme Scita snippet sub-groups
        const scitaGroups = [
            'scita_about_us',
            'scita_banner',
            'scita_blog',
            'scita_testimonial',
            'scita_brand',
            'scita_service',
            'scita_contact',
            'scita_team',
            'scita_portfolio',
            'scita_pricing',
            'scita_case_study',
            'scita_client',
            'scita_category',
            'scita_deal_days',
            'scita_google_map',
            'scita_how_it_works',
            'scita_multi_product',
            'scita_newsletter',
            'scita_statistics',
            'scita_timeline',
            'scita_trust_icon',
            'scita_accordion',
            'scita_content',
            'scita_promo_banner'
        ];

        // Collect all Theme Scita snippets from various categories
        const allScitaSnippets = [];
        
        // Check all existing snippet categories for Theme Scita snippets
        for (const category in this.snippetModel) {
            if (Array.isArray(this.snippetModel[category])) {
                const scitaSnippetsInCategory = this.snippetModel[category].filter(snippet => {
                    // Check if snippet belongs to Theme Scita by looking at its ID or group
                    const snippetId = snippet.id || '';
                    const snippetGroup = snippet.group || '';
                    return snippetId.includes('theme_scita') || 
                           snippetId.includes('scita_') ||
                           snippetGroup === 'theme_scita' ||
                           scitaGroups.includes(snippetGroup);
                });
                
                allScitaSnippets.push(...scitaSnippetsInCategory);
            }
        }

        // Create a dedicated category for Theme Scita if we found snippets
        if (allScitaSnippets.length > 0) {
            this.snippetModel.snippetThemeScita = allScitaSnippets;
            console.log(`Theme Scita: Organized ${allScitaSnippets.length} snippets into hierarchical groups`);
        }

        // Log snippet model structure for debugging
        console.log('Theme Scita hierarchical snippet model initialized:', {
            totalCategories: Object.keys(this.snippetModel).length,
            scitaSnippets: allScitaSnippets.length,
            subGroups: scitaGroups.length
        });
    }
});