import { css } from 'lit';

export default css`
    .family-calendar{}
    .family-calendar--row{
        display: flex;
        align-items: stretch;
    }
    .family-calendar--row-header{
        font-weight: bold;
    }
    .family-calendar--field{
        flex-grow: 1;
    }
    .family-calendar--date{}
`;
