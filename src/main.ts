import '@maptiler/sdk/dist/maptiler-sdk.css';
import './style.css';
import { config, Map } from '@maptiler/sdk';
import { UniversalGeolocateControl } from "./universalgeolocatecontrol";




(async () => {
  // Getting the KEY from .env file
  config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

  // Instanciating the map object
  const map = new Map({
    container: "map",

    // Useless for actual mobil app, but convenient for testing
    hash: true,

    // The default geolocate control will be replaced (see below)
    // by the mobile-friendly one
    geolocateControl: false,

    // This will collapse after first interaction
    attributionControl: {
      compact: true,
    },

    // Showing some branding
    maptilerLogo: true,

    geolocate: true,
  });

  // Waits for the map instance to be ready (loading, styling, etc.)
  await map.onReadyAsync();

  // Adding the mobile-friendly geolocate control
  const geolocateControl = new UniversalGeolocateControl();
  map.addControl(geolocateControl);
})()