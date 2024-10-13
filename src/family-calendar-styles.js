import { css } from 'lit';

export default css`
    .family-calendar--content {
        display: grid;
    }

    .family-calendar--row {
        display: grid;
        gap: 5px;
        border-bottom: 1px solid #ccc;
    }

    .family-calendar--header-row {
        font-weight: bold;
    }

    .family-calendar--row-header {
        font-weight: bold;
    }

    .family-calendar--field {
        padding: 10px;
    }

    .family-calendar--date-field{
        border-left: 1px solid #ccc;
    }

    .family-calendar--date-field-inner-wrapper{
        position: relative;
    }

    .family-calendar--column-header {
        font-weight: bold;
        text-align: center;
        padding: 5px;
    }

    .family-calendar--event-grid {
        display: grid;
        grid-auto-flow: column;
        gap: 10px;
        position: absolute;
        width: 100%;
    }

    .family-calendar--event {
        border-radius: 5px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        color: #333;
        overflow: hidden;
    }

    .family-calendar--event-time {
        font-size: 12px;
        line-height: 12px;
        padding: 5px 5px 0 5px;
    }

    .family-calendar--event-title {
        font-size: 14px;
        line-height: 16px;
        font-weight: bold;
        padding: 0 5px 5px 5px;
    }

    .family-calendar--no-events{
        font-style: italic;
        color: #999;
    }
`;
