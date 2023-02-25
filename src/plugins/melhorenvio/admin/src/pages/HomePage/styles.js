import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const swing = keyframes`
  0% {
    transform: translateX(0%);
  }
  25% {
    transform: rotate(50%);
  }
  50% {
    transform: rotate(0%);
  }
  75% {
    transform: rotate(-50%);
  }
  100% {
    transform: rotate(0%);
  }
`

export const Title = styled.h1`
  margin: 56px;
  color: #a5a5ba;
  text-transform: uppercase;
`

export const Subtitle = styled.h5`
  margin: 0;
  color: #333740;
  word-break: break-all;
  font-size: 0.875rem;
  line-height: 1.43;
`

export const InnerContainer = styled.div`
  background: rgba(0,0,0,0.2);
  border-radius: 5px;
  display: table;
  margin: 0.5rem 0 0;
  min-height: 35px;
  padding: 0.5rem;
  width: fit-content;

  ${Subtitle} {
    display: table-cell;
    font-size: 0.75rem;
    vertical-align: middle;
  }
`

export const Token = styled.h5`
  color: #333740;
  display: table-cell;
  font-size: 0.75rem;
  line-height: 1.43;
  overflow: hidden;
  vertical-align: middle;
  word-break: break-all;
`

export const Span = styled.span`
  float: right;
`

export const TestContainer = styled.div`
  background: rgba(0,0,0,0.2);
  border-radius: 5px;
  display: table;
  margin: 0.5rem 0 0;
  min-height: 35px;
  padding: 0.5rem;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;
  min-height: 235px;
`

export const TestList = styled.ul`
  list-style: none;
  min-width: 350px;
`

export const TestItem = styled.li`
  color: red;
  line-height: 2;
  font-size: 0.75rem;
  color: ${(p) =>
    p.hasPassed
      ? '#39FF14'
        : p.hasPassed === undefined
        ? 'rgba(204, 204, 204, 0.6)'
        : '#ff1818'};

  &:before {
    animation: ${spin} 1s linear infinite;
    animation-name: ${(p) => (p.hasPassed === undefined ? spin : 'none')};
    color: inherit;
    opacity: ${(p) => (p.skipped ? '0' : '1')};
    display: inline-block;
    margin-right: 0.6rem;
    margin-bottom: -1px;
    content: '${(p) =>
    p.hasPassed
      ? '\\2713'
        : p.hasPassed === undefined
        ? '\\22EF'
        : '\\00D7'}';
  }

  ${Span} {
    &:after {
    color: inherit;
    display: inline-block;
    opacity: ${(p) => (p.hasPassed === undefined ? '0' : '1')};
    content: '${(p) => (p.hasPassed ? '\\1F44D' : '\\1F44E')}';
    }
  }

  &&:nth-child(n+5) {
    ${Span} {
      &:after {
      content: '';
      }
    }
  }
`

export const Anchor = styled.a`
    margin: auto 0;
    text-decoration: none;
    width: fit-content;
`

export const Column = styled.div`
  flex-direction: column;
  width: calc(50% - calc(1.5rem/2));

  ${Anchor} {
    margin: unset;
  }
`

export const InnerRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${Column}:nth-child(2) {
    display: flex;
    align-items: end;
  }
`

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  &&:nth-of-type(1) {
    justify-content: start;

    ${InnerContainer} {
      display: flex;
      width: 160px;
    }

    ${Column}:nth-child(1) {

      width: unset;
      margin-right: 1.5rem;
      min-width: calc(350px + 1rem);

      ${Subtitle} {
        margin-bottom: 0.5rem;
      }

      ${Anchor}:nth-child(1) {
        margin-right: 1.5rem;
      }
    }

    ${Column}:nth-child(2) {
      margin-right: 1.5rem;
      width: 160px;
    }

    ${Column}:nth-child(3) {
      width: 160px;
    }

    ${Column}:nth-child(2) ${InnerRow} ${Column}{
      width: 100%;

      ${InnerContainer} {
        width: 100%;
      }
    }
  }

  /* &&:last-of-type { */
  &&:nth-child(3) {
    border-top: #2f2f3c solid 1px;
    padding-top: 1.5rem;
    margin-bottom: 0;

    ${InnerContainer} {
      display: block;
      width: 100%;
      height: 100px;

      &&:nth-of-type(1) {
        width: unset;
      }
    }

    ${InnerContainer}:nth-child(1) {
      width: unset;
    }

    ${Column}:nth-child(1) {
      max-width: 150px;
      margin-right: 1.5rem;

      ${InnerContainer} {
        width: unset;

        text-align: center;
        display: flex;
        align-items: center;
        flex-direction: column;

        ${Subtitle} {
          width: 100%;

          &:nth-child(1) {
            margin-bottom: 0;
            margin-top: auto;
          }

          &:nth-child(2) {
            margin-bottom: auto;
            margin-top: 0;
          }
        }
      }
    }

    ${Column}:nth-child(2) {
      margin-right: 1.5rem;
    }

    ${Column}:nth-child(n+2) {

      ${InnerContainer} {
        overflow-y: scroll;
      }

      ${InnerContainer}::-webkit-scrollbar {
        width: 6px;
        border: 2px solid transparent;
      }

      ${InnerContainer}::-webkit-slider-thumb {
        -webkit-appearance: none !important;
        border: 2px solid transparent;
       }

      ${InnerContainer}::-webkit-scrollbar-thumb {
        background-color: rgba(255,255,255,0.2) !important;
        outline: none !important;
        border-radius: 5px;
        width: 3px !important;
        margin: 2px;
      }

      ${InnerContainer}::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      }
    }
  }
`

export const Container = styled.section`
  background: #212134;
  display: flex;
  flex-direction: column;
  margin: 56px;
  overflow-x: hidden;
  padding: 1.5rem;

  ${Subtitle} {
    color: #a5a5ba;
  }

  &&:nth-of-type(1) {
    background: transparent;
    padding: 0 1.5rem 0 0;
    margin: 0 1.5rem 0 37px;
  }

  &&:nth-of-type(2) {
    background: transparent;
    margin-top: 0;
    padding: 0;
    max-width: 60%;
    text-align: justify;

    ${Subtitle} {
      color: #ffffff;
      word-break: break-word;
      color: #a5a5ba;
      font-size: 1rem;
      line-height: 1.5;
      max-width: 1550px;
    }
  }

  &&:nth-of-type(3) {

    > ${Row}:nth-of-type(2){
      justify-content: start;
    }
  }


  ${Row}:nth-child(2) ${Column}:nth-child(1) {
    /* width: calc(50% - calc(1.5rem/2)); */
    margin-right: 0.75rem;
    width: unset;
  }

  ${Row}:nth-child(2) ${Column}:nth-child(2) {
    overflow-x: hidden;
    width: calc(75% - calc(1.5rem/2));
  }
`

export const Wrap = styled.div`
  width: 80px;
  height: 70px;
  display: flex;
  justify-content: center;

  @media only screen and (min-width: 1024px) {
    width: 190px;
  }
`

export const Btn = styled.button`
  align-items: center;
  background: #7b79ff;
  border: 1px solid #7b79ff;
  border-radius: 4px;
  color: #ffffff;
  cursor: ${(p) => p.isOff ? 'default' : 'pointer'};
  display: flex;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.33;
  margin: 0;
  opacity: ${(p) => p.isOff ? '0.3' : '1'};
  outline: none;
  padding: 8px 16px;

  @media only screen and (min-width: 1024px) {

    &:hover {
      border: 1px solid;
      border-color: ${(p) => p.isOff ? '#7b79ff' : '#4945ff'};
      background: ${(p) => p.isOff ? '#7b79ff' : '#4945ff'};
    }
  }
`

export const ProdsWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  overflow-x: scroll;
  flex-wrap: nowrap;

  &&::-webkit-scrollbar {
    height: 6px;
    border: none;
  }

  &&::-webkit-slider-thumb {
    -webkit-appearance: none !important;
    border: 2px solid transparent;
    }

  &&::-webkit-scrollbar-thumb {
    background-color: rgba(255,255,255,0.2) !important;
    outline: none !important;
    border-radius: 5px;
    height: 3px !important;
    margin: 2px;
  }

  &&::-webkit-scrollbar-track {
    //box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  }
`

export const Prod = styled.div`
  background: rgba(0,0,0,0.2);
  border: 1px solid;
  border-color: ${(p) => p.isOnBag ? 'rgba(255,255,255,0.4)' : 'transparent'};
  border-radius: 5px;
  padding: 0.75rem;
  margin: 0.5rem 1.5rem 0.75rem 0;
  min-height: 235px;
  width: 160px;
  min-width: 160px;

  p {
    line-height: 1.9;
    font-size: 0.75rem;
    color: ${(p) => p.isOnBag ? '#ffffff' : 'rgba(255,255,255,0.3)'};

    span {
      float: right;
    }
  }

  > p {
    color: #a5a5ba;
    font-size: 1rem;
    font-weight: bolder;
    line-height: 1.43;
    margin-bottom: 10px;
    text-transform: uppercase;
  }

  > ${Row}:last-of-type {
    border: none;

    p {
      font-size: 1.2rem;
      font-weight: 700;
    }

    > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
`

export const PostCode = styled.input`
  background: transparent;
  border: none;
  color: ${(p) => p.value.length < 9 ? 'red' : 'rgba(204,204,204,0.6)'};
  display: table-cell;
  font-size: 0.75rem;
  letter-spacing: 2px;
  line-height: 1.9;
  outline: none;
  overflow: hidden;
  padding: 0rem 1rem;
  vertical-align: middle;
  word-break: break-all;
  width: 160px;
  text-align: center;
`

export const Frame = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
`

export const OverFlorwHidden = styled.div`
  overflow-x: hidden;
`
