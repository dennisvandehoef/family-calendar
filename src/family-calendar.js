import { html, LitElement } from 'lit';
import { DateTime } from 'luxon';
import styles from './family-calendar-styles.js';

export class FamilyCalendarCard extends LitElement {
    static styles = styles;

    set hass(hass) {
        this._hass = hass;
    }

    render() {
        return html`
            <ha-card header="Family Calendar">
                <div class="family-calendar--content">
                    ${this._renderHeaderRow()} <!-- Render the column names at the top -->
                    ${this._renderCalendar()}
                </div>
            </ha-card>
        `;
    }

    _renderHeaderRow() {
        return html`
            <div class="family-calendar--row family-calendar--header-row">
                <div class="family-calendar--field family-calendar--row-header"></div> <!-- Empty cell for the date column -->
                ${this.config.columns.map((column) => {
            return html`
                        <div class="family-calendar--field family-calendar--column-header">${column.title}</div>
                    `;
        })}
            </div>
        `;
    }

    _renderCalendar() {
        let currentDate = DateTime.now();
        let endDate = currentDate.plus({ days: 30 });

        let rows = [];

        while (currentDate < endDate) {
            rows.push(this._renderRow(currentDate));
            currentDate = currentDate.plus({ days: 1 });
        }

        return html`
        ${rows.map((row) => html`${row}`)}
        `;
    }

    _renderRow(date) {
        const dateString = date.toFormat('yyyy-MM-dd');

        return html`
        <div class="family-calendar--row">
            <div class="family-calendar--field family-calendar--row-header">${date.toLocaleString(DateTime.DATE_MED)}</div>
            ${this.config.columns.map((column) => {
            const eventsForColumn = this._getEventsForColumn(dateString, column);
            return html`
                    <div class="family-calendar--field family-calendar--date">
                        ${eventsForColumn.length > 0
                    ? eventsForColumn.map(event => html`
                                <div class="family-calendar--event">
                                    <div class="family-calendar--event-time">${event.time}</div>
                                    <div class="family-calendar--event-title">${event.title}</div>
                                </div>
                            `)
                    : 'No events'}
                    </div>
                `;
        })}
        </div>
    `;
    }

    _getEventsForColumn(dateString, column) {
        return column.calendars.map((calendar) => {
            const stateObj = this._hass.states[calendar];
            if (!stateObj || !stateObj.attributes.start_time || !stateObj.attributes.message) {
                return [];
            }

            // Convert to ISO format
            const startTime = stateObj.attributes.start_time.replace(' ', 'T'); // Converts '2024-09-30 15:00:00' to '2024-09-30T15:00:00'
            const eventStart = DateTime.fromISO(startTime);

            // Check if the event date matches the date of the row
            if (eventStart.toFormat('yyyy-MM-dd') === dateString) {
                const endTime = stateObj.attributes.end_time ? stateObj.attributes.end_time.replace(' ', 'T') : null;
                const timeRange = endTime
                    ? `${eventStart.toLocaleString(DateTime.TIME_SIMPLE)} - ${DateTime.fromISO(endTime).toLocaleString(DateTime.TIME_SIMPLE)}`
                    : `${eventStart.toLocaleString(DateTime.TIME_SIMPLE)}`;

                return {
                    time: timeRange,
                    title: stateObj.attributes.message
                };
            }
            return [];
        }).flat(); // Flatten the array
    }

    setConfig(config) {
        if (!config.columns || !Array.isArray(config.columns)) {
            throw new Error("You need to define columns with titles and associated calendars.");
        }
        this.config = config;
    }

    getCardSize() {
        return 5;
    }

    getLayoutOptions() {
        return {
            grid_rows: 3,
            grid_columns: this.config.columns.length, // Dynamic columns
            grid_min_rows: 3,
            grid_max_rows: 3,
        };
    }
}
