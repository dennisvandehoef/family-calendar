import { css } from 'lit';

export default css`
    .family-calendar--content{}
    .family-calendar--row{
        display: flex;
        align-items: stretch;
    }
    .family-calendar--header-row{
        font-weight: bold;
        border-bottom: 2px solid #ccc;
    }
    .family-calendar--row-header{
        font-weight: bold;
    }
    .family-calendar--field{
        flex-grow: 1;
        padding: 10px;
    }
    .family-calendar--date {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .family-calendar--column-header {
        font-weight: bold;
        text-align: center;
        padding: 5px;
        border-bottom: 1px solid #ddd;
    }
    .family-calendar--event {
        margin-top: 2px;
        padding: 3px;
        background-color: #f0f0f0;
        border-radius: 3px;
    }
`;
