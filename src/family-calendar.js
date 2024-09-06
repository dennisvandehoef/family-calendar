import { html, LitElement } from 'lit';

export class FamilyCalendarCard extends LitElement {
    static hass

    // set hass(hass) {
    //     this.hass = hass;
    // }

    render() {
        const entityId = this.config.entity;
        const state = this.hass.states[entityId];
        const stateStr = state ? state.state : "unavailable";

        return html`
            <ha-card header="Family Calender">
                <div class="card-content">
                    The state of ${entityId} is ${stateStr}!
                </div>
            </ha-card>
        `;
    }

    // The user supplied configuration. Throw an exception and Home Assistant
    // will render an error card.
    setConfig(config) {
        if (!config.entity) {
            throw new Error("You need to define an entity");
        }
        this.config = config;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns in masonry view
    getCardSize() {
        return 3;
    }

    // The rules for your card for sizing your card if the grid in section view
    getLayoutOptions() {
        return {
            grid_rows: 3,
            grid_columns: 2,
            grid_min_rows: 3,
            grid_max_rows: 3,
        };
    }

}
