import { createGlobalStyle } from 'styled-components';
import { rem} from "polished";
import { typography, colors } from './variables';
import { device } from './breakpoints';

const { normal, grey, lightGrey } = colors;
const { regular } = typography;

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    font-family: 'Space Grotesk', Verdana, Arial, Helvetica, sans-serif;
    font-size: 1rem;
    font-weight: ${regular};
    color: ${normal};
    font-feature-settings: 'ss04' on;
    -webkit-font-smoothing: antialiased;
    background: #faf8f6;
    position: relative;
  }

  h1,
  h1 span,
  h2,
  h2 span {
    margin: 0;
    font-weight: ${regular};
  }

  h1,
  h1 span {
    font-family: 'Laforgestencil', Verdana, Arial, Helvetica, sans-serif;
    font-size: 3.5rem;
    line-height: 1.15;
  }

  h2,
  h2 span {
    font-size: 2rem;
    line-height: 1.2;
  }

  h3,
  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 400;
  }

  span {
    font-family: ${typography.defaultFont};
    font-size: ${rem(typography.defaultSize)};
    font-feature-settings: 'ss04' on;
  }

  p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.3;

    &:not(:last-child) {
      margin-bottom: ${rem('10px')};
    }
  }

  pre {
    border: 1px solid ${grey};
    border-radius: 4px;
    background-color: ${lightGrey};
    padding: ${rem('15px')};
  }

  @media ${device.l} {
    h1,
    h1 span {
      font-size: 6rem;
      line-height: 1.1;
    }

    h2,
    h2 span {
      font-size: 2.5rem;
    }
  }

  .is-third {
    width: 33.3333vw;
    min-width: 28rem;
  }

  .c-increase-decrease-input div {
    height: 2rem;


    button {
      height: 2rem;
      width: 2rem;
    }
    input {
      height: 2rem;
      padding-left: 0;
      padding-right: 0;
    }
  }

  .col-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .c-marquee {
    writing-mode: vertical-lr;
    height: 100%;
    font-size: 8rem;
    line-height: 4;
    white-space: nowrap;
    transform: rotate(180deg);
    position: absolute;
    z-index: -1;
    color: #2b7984;

    &.is-flipped {
      transform: none;
    }
  }

  .c-card {
    border: 0.0625rem solid #939393;
    border-radius: 0.375rem;
    background-color: #ffffff;
    padding: 1rem;
    & > div {
      width: 100%;
    }

    input {
      width: 100%;
    }
  }
  .full-width {
    width: 100%;
  }
`;

export default GlobalStyle;
