import {html} from 'lit';
import {SmartBioView} from '../helpers/view.js';

export class SmartBioProfile extends SmartBioView {
    renderView() {
        return html`<h1> Welcome to Smartbio profile page.</h1> <p>This is for the profile page</p>`;
    }
}

customElements.define('smartbio-profile', SmartBioProfile);
