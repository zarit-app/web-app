import "@/styles/globals.css";

import { App } from "@/components/App.tsx";

import { LocaleContextProvider } from "@/states/locale";

import { transitions, positions, Provider as AlertProvider } from "react-alert";
import { AlertTemplate } from "@/components/AlertTemplate";

import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

function MyApp(props) {
  // optional configuration
  const options = {
    // you can also just use 'bottom center'
    position: positions.BOTTOM_CENTER,
    timeout: 10000,
    offset: "30px",
    // you can also just use 'scale'
    transition: transitions.SCALE,
  };

  return (
    <LocaleContextProvider>
      <AlertProvider template={AlertTemplate} {...options}>
        <App {...props} />
      </AlertProvider>
    </LocaleContextProvider>
  );
}

export default MyApp;
