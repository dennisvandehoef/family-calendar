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
        this.numberOfDays = 30; // the number of days we want to render
        this.endDate = this.currentDate.plus({ days: this.numberOfDays }); // Calculated only once
        this.colorIndex = 0; // Index for unique color generation
        this.timeFormat = '24-hour'; // Default time format
        this.oneHourHeight = 40; // the height of one hour in pixels
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
            <div class="family-calendar--row family-calendar--header-row" style="${this._rowColumnStyle()}">
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

    _rowColumnStyle() {
        const columnsCss = ' 3fr'.repeat(this.config.columns.length);
        return 'grid-template-columns: 1fr' + columnsCss + ';';
    }

    _renderRow(date) {
        const dateString = date.toFormat('yyyy-MM-dd');
        const allEventsForDate = this._getAllEventsForDate(dateString);
        const earliestEvent = this._findEarliestStartingEvent(allEventsForDate);


        return html`
        <div class="family-calendar--row" style="${this._rowColumnStyle()}">
            <div class="family-calendar--field family-calendar--row-header">${date.toLocaleString(DateTime.DATE_MED)}</div>
            ${this.config.columns.map((column) => {
            // Gather all events for the calendars associated with this column
            const eventsForColumn = allEventsForDate.filter(event => column.calendars.includes(event.calendar));

            // Group overlapping events
            const eventGroups = this._groupOverlappingEvents(eventsForColumn);

            if (eventGroups.length == 0) {
                return html`<div class="family-calendar--field family-calendar--date-field family-calendar--no-events">No events</div>`
            }

            const { top: baselineTop } = this._calculatePosition(earliestEvent.start, earliestEvent.end);
            let fullHeight = 0;

            return html`
                    <div class="family-calendar--field family-calendar--date-field">
                    <div class="family-calendar--date-field-inner-wrapper">
                        ${eventGroups.map(group => {
                // Assume the first event in the group defines the start time
                const start = DateTime.fromISO(group[0].start);
                const end = group.reduce((latestEnd, event) => {
                    const eventEnd = event.end ? DateTime.fromISO(event.end) : DateTime.fromISO(event.start).plus({ hours: 1 });
                    return latestEnd > eventEnd ? latestEnd : eventEnd;
                }, start);

                const { top, height } = this._calculatePosition(start, end, baselineTop);

                fullHeight = height + top;

                return html`
                        <div class="family-calendar--event-grid" style="top:${top}px; height: ${height}px; grid-template-columns: repeat(${group.length}, 1fr);">
                            ${group.map(event => {
                    const { top: eventTop, height: eventHeight } = this._calculatePosition(event.start, event.end, (baselineTop + top));

                    return html`
                            <div class="family-calendar--event" style="min-height: ${this.oneHourHeight}px; margin-top:${eventTop}px; height: ${eventHeight}px; background-color: ${this.calendarColors[event.calendar]};">
                                <div class="family-calendar--event-time">${event.time}</div>
                                <div class="family-calendar--event-title">${event.title}</div>
                            </div>
                        `})}
                    </div>
                `;
            })}
                <div class="family-calendar--event-height-filler" style="height: ${fullHeight}px;"></div>
            </div>
            </div>
            `;
        })}
        </div>
    `;
    }

    _calculatePosition(start, end, reduceTop = 0) {
        const startMinutes = (start.hour * 60) + start.minute;
        const endMinutes = (end.hour * 60) + end.minute;
        const durationMinutes = endMinutes - startMinutes;

        const minuteHeight = this.oneHourHeight / 60;

        // Convert to percentage or pixel-based positioning
        const top = (startMinutes * minuteHeight) - reduceTop;
        const height = durationMinutes * minuteHeight;

        return { top, height };
    }

    _findEarliestStartingEvent(events) {
        if (!events || events.length === 0) {
            return null; // Return null if there are no events
        }

        return events.reduce((earliest, current) => {
            const earliestStart = DateTime.fromISO(earliest.start);
            const currentStart = DateTime.fromISO(current.start);

            return currentStart < earliestStart ? current : earliest;
        });
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
        const overlapExtra = 5 * 60; // events starting and ending within x minutes, should be considered overlapping
        const event1Start = event1.start.ts;
        const event1End = (event1.end + overlapExtra);
        const event2Start = event2.start.ts;
        const event2End = event2.end.ts;

        return (event1Start < event2End) && (event1End > event2Start);
    }

    _getAllEventsForDate(dateString) {
        const allEvents = [];
        const currentDate = DateTime.fromISO(dateString);
        const nextDate = currentDate.plus({ days: 1 });

        for (const calendar of Object.keys(this.events)) {
            const events = this.events[calendar] || [];

            // Assign color to calendar if it doesn't already have one
            if (!this.calendarColors[calendar]) {
                this.calendarColors[calendar] = this._generateLightColor();
            }

            events.forEach(event => {
                const eventStart = DateTime.fromISO(event.start);
                let eventEnd = event.end ? DateTime.fromISO(event.end) : null;

                // Handle events that have no explicit end time or are all-day
                if (!eventEnd) {
                    if (event.all_day) {
                        eventEnd = eventStart.endOf('day');
                    } else {
                        eventEnd = eventStart.plus({ hours: 1 }); // Default 1-hour duration
                    }
                }

                // Check if the event spans the current date
                const eventStartsToday = eventStart >= currentDate && eventStart < nextDate;
                const eventEndsToday = eventEnd >= currentDate && eventEnd < nextDate;
                const eventSpansToday = eventStart < currentDate && eventEnd >= nextDate;

                if (eventStartsToday || eventEndsToday || eventSpansToday) {
                    const isFullDayEvent = event.all_day;

                    // Adjust start and end times for multi-day events
                    const adjustedStart = eventStart < currentDate ? currentDate.startOf('day') : eventStart;
                    const adjustedEnd = eventEnd > nextDate ? currentDate.endOf('day') : eventEnd;

                    const timeRange = isFullDayEvent
                        ? 'All Day'
                        : this.timeFormat === '24-hour'
                            ? `${adjustedStart.toLocaleString(DateTime.TIME_24_SIMPLE)} - ${adjustedEnd.toLocaleString(DateTime.TIME_24_SIMPLE)}`
                            : `${adjustedStart.toLocaleString(DateTime.TIME_SIMPLE)} - ${adjustedEnd.toLocaleString(DateTime.TIME_SIMPLE)}`;

                    allEvents.push({
                        time: timeRange,
                        title: event.summary,
                        calendar,
                        start: adjustedStart,
                        end: adjustedEnd,
                    });
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
        return Math.ceil(this.config.numberOfDays * 1.5);
    }

    getLayoutOptions() {
        return {
            grid_min_rows: this.config.numberOfDays,
            grid_rows: this.getCardSize(),
            grid_min_columns: this.config.columns.length,
            grid_columns: this.config.columns.length + 1,
        };
    }
}
