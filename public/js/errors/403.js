import {LitElement, html} from 'lit';

export class SmartBioForbidden extends LitElement {
    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <div class="text-center py-5">
                <h1 class="display-5">403</h1>
                <p>You don't have permission to view this page.</p>
                <a href="#/">Back to home</a>
            </div>
        `;
    }
}

customElements.define('smartbio-forbidden', SmartBioForbidden);
