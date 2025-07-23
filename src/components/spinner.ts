export const spinner = () => {
  const spinners = [spinner1, spinner2]
  const spinner = spinners[Math.floor(Math.random() * spinners.length)]()
  const wrapper = document.createElement('slot')
  wrapper.className = 'absoluteCenter'
  wrapper.append(spinner[0], spinner[1])
  return wrapper
}

const spinner1 = () => {
  const styles = document.createElement('style')
  styles.textContent = `.loader {
  width: 48px;
  height: 48px;
  border: 2px solid var(--schoolPrimaryColor);
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: rotation 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite alternate;
}
.loader::after,
.loader::before {
  content: '';  
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  background: var(--schoolSecondaryColor);
  width: 6px;
  height: 6px;
  transform: translate(150%, 150%);
  border-radius: 50%;
}
.loader::before {
  left: auto;
  top: auto;
  right: 0;
  bottom: 0;
  transform: translate(-150%, -150%);
}

@keyframes rotation {
  0% {
    transform: rotate(45deg);
  }
  50% {
    transform: rotate(225deg);
  }
  100% {
    transform: rotate(405deg);
  }
} `
  const spinner = document.createElement('span')
  spinner.className = 'loader'
  return [styles, spinner]
}
const spinner2 = () => {
  const styles = document.createElement('style')
  styles.textContent = `.loader {
        transform: rotateZ(45deg);
        perspective: 1000px;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        color: var(--schoolPrimaryColor);
      }
        .loader:before,
        .loader:after {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: inherit;
          height: inherit;
          border-radius: 50%;
          transform: rotateX(70deg);
          animation: 1s spin linear infinite;
        }
        .loader:after {
          color: var(--schoolSecondaryColor);
          transform: rotateY(70deg);
          animation-delay: .4s;
        }

      @keyframes rotate {
        0% {
          transform: translate(-50%, -50%) rotateZ(0deg);
        }
        100% {
          transform: translate(-50%, -50%) rotateZ(360deg);
        }
      }

      @keyframes rotateccw {
        0% {
          transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
          transform: translate(-50%, -50%) rotate(-360deg);
        }
      }

      @keyframes spin {
        0%,
        100% {
          box-shadow: .2em 0px 0 0px currentcolor;
        }
        12% {
          box-shadow: .2em .2em 0 0 currentcolor;
        }
        25% {
          box-shadow: 0 .2em 0 0px currentcolor;
        }
        37% {
          box-shadow: -.2em .2em 0 0 currentcolor;
        }
        50% {
          box-shadow: -.2em 0 0 0 currentcolor;
        }
        62% {
          box-shadow: -.2em -.2em 0 0 currentcolor;
        }
        75% {
          box-shadow: 0px -.2em 0 0 currentcolor;
        }
        87% {
          box-shadow: .2em -.2em 0 0 currentcolor;
        }
      }
   `
  const spinner = document.createElement('span')
  spinner.className = 'loader'
  return [styles, spinner]
}
