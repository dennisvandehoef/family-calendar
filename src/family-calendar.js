import { html, LitElement } from 'lit';
import { DateTime } from 'luxon';
import styles from './family-calendar-styles.js';

export class FamilyCalendarCard extends LitElement {
    static styles = styles;

    set hass(hass) {
        this._hass = hass;
        if (!this._eventsFetched) {
            this._fetchEvents();
        }
    }

    constructor() {
        super();
        this.events = {}; // Contains events for each calendar
        this._eventsFetched = false;
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
            const eventsForColumn = this._getEventsForColumn(dateString, column.calendars);
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

    _getEventsForColumn(dateString, calendars) {
        const eventsForColumn = [];

        // Loop through each calendar in the column
        calendars.forEach(calendar => {
            if (this.events[calendar]) {
                this.events[calendar].forEach(event => {
                    const eventStart = DateTime.fromISO(event.start);
                    const eventEnd = DateTime.fromISO(event.end);

                    // Check if the event date matches the row's date or spans over this date
                    if (eventStart.toFormat('yyyy-MM-dd') === dateString || (eventStart < DateTime.fromISO(dateString) && eventEnd >= DateTime.fromISO(dateString))) {
                        const isFullDayEvent = eventStart.hasSame(eventEnd, 'day') && event.all_day;

                        const timeRange = isFullDayEvent
                            ? 'All Day'
                            : `${eventStart.toLocaleString(DateTime.TIME_SIMPLE)} - ${eventEnd.toLocaleString(DateTime.TIME_SIMPLE)}`;

                        eventsForColumn.push({
                            time: timeRange,
                            title: event.summary,
                        });
                    }
                });
            }
        });

        return eventsForColumn;
    }

    async _fetchEvents() {
        let currentDate = DateTime.now();
        let endDate = currentDate.plus({ days: 30 });

        let startDateISO = currentDate.toISO();
        let endDateISO = endDate.toISO();

        // Clear all previous events before fetching new ones
        this.events = {};

        this.config.columns.forEach(column => {
            column.calendars.forEach(calendar => {
                // Reset events for each calendar before fetching
                this.events[calendar] = [];

                this._hass.callApi(
                    'get',
                    `calendars/${calendar}?start=${encodeURIComponent(startDateISO)}&end=${encodeURIComponent(endDateISO)}`
                ).then(response => {
                    response.forEach(event => {
                        const startDate = DateTime.fromISO(event.start.dateTime);
                        const endDate = DateTime.fromISO(event.end.dateTime);

                        let fullDay = !event.start.dateTime;

                        this.events[calendar].push({
                            summary: event.summary,
                            start: startDate.toISO(),
                            end: endDate.toISO(),
                            all_day: fullDay,
                        });
                    });

                    this._eventsFetched = true;
                    this.requestUpdate(); // Re-render after events are fetched
                }).catch(error => {
                    console.error('Error while fetching calendar:', error);
                });
            });
        });
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
