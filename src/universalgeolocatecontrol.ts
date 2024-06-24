import { IControl, LngLat, Map, Marker } from "@maptiler/sdk";
import { Geolocation, Position } from '@capacitor/geolocation';


export class UniversalGeolocateControl implements IControl {
  private controlButton!: HTMLButtonElement;
  private controlButtonContainer!: HTMLDivElement;
  private waiting: boolean = false;
  private watchingCallbackID?: string;
  private lastPosition: LngLat = new LngLat(0, 0);
  private isWatching: boolean = false;
  private shouldTrack: boolean = false;
  private map?: Map;
  private dotElement?: HTMLDivElement;
  private locationDotMarker?: Marker;


  onAdd(map: Map): HTMLElement {
    this.map = map;

    this.dotElement = document.createElement("div");
    this.dotElement.classList.add("maplibregl-user-location-dot");
    this.locationDotMarker = new Marker({element: this.dotElement});
    
    // Creation of the button to show on map
    this.controlButtonContainer = window.document.createElement("div");


      this.controlButtonContainer.className =
        "maplibregl-ctrl maplibregl-ctrl-group";

      this.controlButton = window.document.createElement("button");
      this.controlButton.classList.add('maplibregl-ctrl-geolocate');

      this.controlButtonContainer.appendChild(this.controlButton);

      const iconSpan = window.document.createElement("span");
      iconSpan.className = "maplibregl-ctrl-icon";
      iconSpan.setAttribute("aria-hidden", "true");
      this.controlButton.appendChild(iconSpan);
      this.controlButton.type = "button";

      const flagFittingDisruption = () => {
        if (!this.isWatching) return;
        this.shouldTrack = false;
        this.controlButton.classList.add('maplibregl-ctrl-geolocate-background');
      };

      this.map.on("click", flagFittingDisruption);
      this.map.on("dblclick", flagFittingDisruption);
      this.map.on("dragstart", flagFittingDisruption);
      this.map.on("mousedown", flagFittingDisruption);
      this.map.on("touchstart", flagFittingDisruption);
      this.map.on("wheel", flagFittingDisruption);


      this.controlButton.addEventListener("click", async () => {
        if (!this.map || !this.locationDotMarker) return;

        // Waiting happens between starting to watch and having the first location
        if (this.waiting) return;

        // Start watching only if not already watching
        if (!this.isWatching) {
          this.shouldTrack = true;

          Geolocation.watchPosition({enableHighAccuracy: true}, (position: Position | null, err?: any) => {
            if (!this.map || !this.locationDotMarker) return;

            this.waiting = false;
            if (err) {
              this.isWatching = false;
              return;
            }

            // Position could be missing while still in watch mode (a tunnel?)
            if (!position) {
              return;
            }

            this.lastPosition.lat = position.coords.latitude;
            this.lastPosition.lng = position.coords.longitude;

            // Updating dot marker
            this.locationDotMarker.setLngLat(this.lastPosition);

            // If we are just starting to watch position, then we must add the marker
            if (!this.isWatching) {
              this.locationDotMarker.addTo(this.map);
            }

            this.isWatching = true;

            if (this.shouldTrack) {
              this.controlButton.classList.remove('maplibregl-ctrl-geolocate-waiting');
              this.map?.easeTo({
                center: this.lastPosition,
              });
            }

          }).then((callbackID: string) => {
            this.waiting = true;
            this.watchingCallbackID = callbackID;
            this.controlButton.classList.add('maplibregl-ctrl-geolocate-active');
            this.controlButton.classList.add('maplibregl-ctrl-geolocate-waiting');
          });

          return;
        }

        // From there, it is watching

        // check if map is centered on last GPS location
        const isMapCenteredOnGPS = this.map.getCenter().distanceTo(this.lastPosition) < 10;

        // If centered, we consider that we want to turn the GPS off
        if (isMapCenteredOnGPS) {
          this.shouldTrack = false;
          this.waiting = false;
          this.isWatching = false;
          Geolocation.clearWatch({ id: this.watchingCallbackID as string });
          this.watchingCallbackID = undefined;
          this.controlButton.classList.remove('maplibregl-ctrl-geolocate-active');
          this.controlButton.classList.remove('maplibregl-ctrl-geolocate-background');

          if (this.locationDotMarker)
            this.locationDotMarker.remove();
        }

        // If not centered, we consider we want to recenter on GPS location
        else {
          this.shouldTrack = true;
          this.controlButton.classList.remove('maplibregl-ctrl-geolocate-background');
          this.controlButton.classList.add('maplibregl-ctrl-geolocate-active');
          this.map?.easeTo({
            center: this.lastPosition,
          });
        }  

      });
    

    return this.controlButtonContainer;
  }


  onRemove(map: Map): void {
    console.log(map);
    
    this.controlButtonContainer.parentNode?.removeChild(
      this.controlButtonContainer
    );
  }

  
} 