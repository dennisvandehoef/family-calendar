import { css } from 'lit';

export default css`
    .family-calendar--content {
        display: flex;
        flex-direction: column;
    }

    .family-calendar--row {
        display: grid;
        grid-template-columns: auto 1fr 1fr 1fr; /* Adjust the number of columns */
        align-items: start;
    }

    .family-calendar--header-row {
        font-weight: bold;
        border-bottom: 2px solid #ccc;
    }

    .family-calendar--row-header {
        font-weight: bold;
    }

    .family-calendar--field {
        padding: 10px;
    }

    .family-calendar--column-header {
        font-weight: bold;
        text-align: center;
        padding: 5px;
        border-bottom: 1px solid #ddd;
    }

    .family-calendar--event-grid {
        display: grid;
        grid-auto-flow: column;
        gap: 5px; /* Space between events */
    }

    .family-calendar--event {
        padding: 5px;
        background-color: #f0f0f0;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        color: #333;
    }

    .family-calendar--event-time {
        font-size: 12px;
    }

    .family-calendar--event-title {
        font-size: 14px;
        font-weight: bold;
    }
`;
