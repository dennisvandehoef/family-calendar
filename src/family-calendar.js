import { html, LitElement } from 'lit';
import { DateTime } from 'luxon';
import styles from './family-calendar-styles.js';

// import { customElement } from 'lit/decorators.js';
export class FamilyCalendarCard extends LitElement {
    static hass
    static styles = styles;

    // set hass(hass) {
    //     this.hass = hass;
    // }

    render() {
        return html`
            <ha-card header="Family Calender">
                <div class="card-content family-calendar">
                    ${this._renderCalendar()}
                </div>
            </ha-card>
        `;
    }

    _renderCalendar() {
        let currentDate = DateTime.now();
        let endDate = currentDate.plus({ days: 30 });

        let rows = [];
        let columns = ['person 1', 'person 2', 'person 3', 'person 4', 'person 5'];

        while (currentDate < endDate) {
            rows.push(this._renderRow(currentDate, columns));
            currentDate = currentDate.plus({ days: 1 });
        }

        return html`
        ${rows.map((row) => {
            return html`${row}`
        })}
        `
    }

    _renderRow(date, columns) {
        return html`
            <div class="family-calendar--row">
                <div class="family-calendar--field family-calendar--row-header">${date}</div>
                ${columns.map((column) => {
            return html`
                        <div class="family-calendar--field family-calendar--date">${column}</div>
                    `
        })}
            </div>
        `
    }


    setConfig(config) {
        if (!config.entity) {
            throw new Error("You need to define an entity");
        }
        this.config = config;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns in masonry view
    getCardSize() {
        return 5;
    }

    // The rules for your card for sizing your card if the grid in section view
    getLayoutOptions() {
        return {
            grid_rows: 3,
            grid_columns: 5,
            grid_min_rows: 3,
            grid_max_rows: 3,
        };
    }

}
