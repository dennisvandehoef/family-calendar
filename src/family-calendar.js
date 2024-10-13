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
        this.events = {}; // Holds events for each calendar
        this.calendarColors = {}; // Map calendar to color
        this._eventsFetched = false;
        this.currentDate = DateTime.now();
        this.endDate = this.currentDate.plus({ days: 30 }); // Calculated only once
        this.colorIndex = 0; // Index for unique color generation
        this.timeFormat = '24-hour'; // Default time format
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
                ${this.config.columns.map((column) => html`
                    <div class="family-calendar--field family-calendar--column-header">${column.title}</div>
                `)}
            </div>
        `;
    }

    _renderCalendar() {
        const rows = [];
        let currentDate = this.currentDate;

        while (currentDate < this.endDate) {
            rows.push(this._renderRow(currentDate));
            currentDate = currentDate.plus({ days: 1 });
        }

        return html`${rows.map((row) => html`${row}`)}`;
    }

    _renderRow(date) {
        const dateString = date.toFormat('yyyy-MM-dd');
        const allEventsForDate = this._getAllEventsForDate(dateString);

        return html`
        <div class="family-calendar--row">
            <div class="family-calendar--field family-calendar--row-header">${date.toLocaleString(DateTime.DATE_MED)}</div>
            ${this.config.columns.map((column) => {
            // Gather all events for the calendars associated with this column
            const eventsForColumn = allEventsForDate.filter(event => column.calendars.includes(event.calendar));

            // Group overlapping events
            const eventGroups = this._groupOverlappingEvents(eventsForColumn);

            return html`
                    <div class="family-calendar--field family-calendar--date">
                        ${eventGroups.length > 0
                    ? eventGroups.map(group => html`
                                <div class="family-calendar--event-grid" style="grid-template-columns: repeat(${group.length}, 1fr);">
                                    ${group.map(event => html`
                                        <div class="family-calendar--event" style="background-color: ${this.calendarColors[event.calendar]};">
                                            <div class="family-calendar--event-time">${event.time}</div>
                                            <div class="family-calendar--event-title">${event.title}</div>
                                        </div>
                                    `)}
                                </div>
                            `)
                    : 'No events'}
                    </div>
                `;
        })}
        </div>
    `;
    }

    _groupOverlappingEvents(events) {
        const eventGroups = [];

        events.forEach(event => {
            let addedToGroup = false;

            // Check if the event overlaps with any event in the group
            for (const group of eventGroups) {
                let overlapsWithGroup = false;

                // Compare the event with all events in the current group
                for (const groupEvent of group) {
                    if (this._eventsOverlap(groupEvent, event)) {
                        overlapsWithGroup = true;
                        break; // If overlap is found, no need to check further
                    }
                }

                // If it overlaps with any event in the group, add it to this group
                if (overlapsWithGroup) {
                    group.push(event);
                    addedToGroup = true;
                    break; // Stop checking other groups if event is added
                }
            }

            // If no overlap with any group, create a new group for this event
            if (!addedToGroup) {
                eventGroups.push([event]);
            }
        });

        return eventGroups;
    }

    /**
     * Checks if two events overlap.
     * @param {Object} event1 - First event
     * @param {Object} event2 - Second event
     * @returns {boolean} - True if the events overlap, false otherwise
     */
    _eventsOverlap(event1, event2) {
        const event1Start = event1.start;
        const event1End = event1.end;
        const event2Start = event2.start;
        const event2End = event2.end;

        return (event1Start < event2End) && (event1End > event2Start);
    }

    _getAllEventsForDate(dateString) {
        const allEvents = [];

        for (const calendar of Object.keys(this.events)) {
            const events = this.events[calendar] || [];

            // Assign color to calendar if it doesn't already have one
            if (!this.calendarColors[calendar]) {
                this.calendarColors[calendar] = this._generateLightColor();
            }

            events.forEach(event => {
                const eventStart = DateTime.fromISO(event.start);
                let eventEnd = event.end ? DateTime.fromISO(event.end) : null;

                // Handle full-day events or events without an explicit end
                if (!eventEnd) {
                    if (event.all_day) {
                        // Set full-day event as lasting from start of the day to the end
                        eventEnd = eventStart.endOf('day');
                    } else {
                        // Default to 1-hour duration for events without an end
                        eventEnd = eventStart.plus({ hours: 1 });
                    }
                }

                // Event occurs on the same day or spans this date
                const isOnDate = eventStart.toFormat('yyyy-MM-dd') === dateString ||
                    (eventStart < DateTime.fromISO(dateString) && eventEnd >= DateTime.fromISO(dateString));

                if (isOnDate) {
                    const isFullDayEvent = event.all_day;
                    const timeRange = isFullDayEvent
                        ? 'All Day'
                        : this.timeFormat === '24-hour'
                            ? `${eventStart.toLocaleString(DateTime.TIME_24_SIMPLE)} - ${eventEnd.toLocaleString(DateTime.TIME_24_SIMPLE)}`
                            : `${eventStart.toLocaleString(DateTime.TIME_SIMPLE)} - ${eventEnd.toLocaleString(DateTime.TIME_SIMPLE)}`;

                    allEvents.push({ time: timeRange, title: event.summary, calendar, start: eventStart, end: eventEnd });
                }
            });
        }

        // Sort events by start time
        return allEvents.sort((a, b) => a.start - b.start);
    }

    _generateLightColor() {
        // Generates a random light color
        const h = Math.floor(Math.random() * 360); // Hue
        const s = 70; // Saturation
        const l = Math.floor(Math.random() * 30 + 70); // Lightness (70% to 100%)
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    async _fetchEvents() {
        const startDateISO = this.currentDate.startOf('day').toISO(); // Start of today
        const endDateISO = this.endDate.toISO(); // End date remains the same

        this.events = {}; // Reset all events before fetching

        const fetchCalendarEvents = async (calendar) => {
            try {
                const response = await this._hass.callApi(
                    'get',
                    `calendars/${calendar}?start=${encodeURIComponent(startDateISO)}&end=${encodeURIComponent(endDateISO)}`
                );

                return response.map(event => ({
                    summary: event.summary,
                    start: event.start.dateTime,
                    end: event.end.dateTime,
                    all_day: !event.start.dateTime,
                }));
            } catch (error) {
                console.error('Error fetching calendar events:', error);
                return [];
            }
        };

        // Create a unique set of calendars to avoid duplicate fetch calls
        const uniqueCalendars = new Set(
            this.config.columns.flatMap(column => column.calendars)
        );

        // Fetch events for each unique calendar
        const calendarPromises = Array.from(uniqueCalendars).map(async (calendar) => {
            const events = await fetchCalendarEvents(calendar);
            this.events[calendar] = events;
        });

        // Wait for all calendar fetches to complete
        await Promise.all(calendarPromises);

        this._eventsFetched = true;
        this.requestUpdate(); // Trigger re-render after events are fetched
    }

    setConfig(config) {
        if (!config.columns || !Array.isArray(config.columns)) {
            throw new Error("You need to define columns with titles and associated calendars.");
        }

        // Check for time format in the configuration
        this.timeFormat = config.time_format || '24-hour'; // Default to 24-hour if not specified
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
