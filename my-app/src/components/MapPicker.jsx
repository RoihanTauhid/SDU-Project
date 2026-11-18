import { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrosshairs,
  faSpinner,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

// Configure default marker icon for Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Internal map controller for smooth flying & click handling
function MapLocationController({
  position,
  setPosition,
  setLatitude,
  setLongitude,
  flyTarget,
  setFlyTarget,
}) {
  const map = useMap();

  // Smoothly fly to target when coordinates change via locate
  useEffect(() => {
    if (flyTarget && flyTarget[0] && flyTarget[1]) {
      map.flyTo(flyTarget, 17, {
        animate: true,
        duration: 1.2,
      });
      setFlyTarget(null);
    }
  }, [flyTarget, map, setFlyTarget]);

  // Click on map to place pin
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLatitude(lat);
      setLongitude(lng);
    },
  });

  return (
    <>
      {position && (
        <Marker
          position={position}
          draggable={true}
          eventHandlers={{
            dragend(e) {
              const marker = e.target;
              const newPos = marker.getLatLng();
              setPosition([newPos.lat, newPos.lng]);
              setLatitude(newPos.lat);
              setLongitude(newPos.lng);
            },
          }}
        >
          <Popup>
            <div style={{ textAlign: "center", padding: "2px 4px" }}>
              <strong style={{ color: "#006241", fontSize: "12px" }}>
                Titik Penjemputan SDU
              </strong>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Pin dapat digeser langsung ke depan pagar rumah Anda
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

function MapPicker({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  locateTrigger,
}) {
  const defaultCoords = [-6.2088, 106.8456]; // Jakarta / default center
  const initialPos =
    latitude && longitude ? [latitude, longitude] : null;

  const [position, setPosition] = useState(initialPos);
  const [flyTarget, setFlyTarget] = useState(initialPos);
  const [isLocating, setIsLocating] = useState(false);

  // Function to locate user using browser Geolocation API
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Browser Anda belum mendukung fitur GPS lokasi (Geolocation).");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newCoords = [lat, lng];

        setPosition(newCoords);
        setFlyTarget(newCoords);
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation warning:", err);
        setIsLocating(false);
        // Fallback or friendly notice
        if (err.code === 1) {
          alert(
            "Izin akses GPS dinonaktifkan di browser. Silakan aktifkan izin lokasi atau klik langsung pada peta untuk menandai titik penjemputan Anda."
          );
        } else {
          alert("Gagal mendeteksi sinyal GPS. Silakan klik langsung pada peta.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [setLatitude, setLongitude]);

  // Initial auto-detection on first mount if coordinates not yet set
  useEffect(() => {
    if (!latitude || !longitude) {
      handleLocateUser();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger locate if parent requests it via locateTrigger
  useEffect(() => {
    if (locateTrigger > 0) {
      handleLocateUser();
    }
  }, [locateTrigger, handleLocateUser]);

  return (
    <div style={{ position: "relative", width: "100%", height: "300px" }}>
      {/* Floating "Ke Lokasi Saya" Button on the Map */}
      <button
        type="button"
        className="sdu-map-floating-gps-btn"
        onClick={handleLocateUser}
        disabled={isLocating}
        title="Kembali ke Lokasi Saya Sekarang (GPS)"
      >
        <FontAwesomeIcon
          icon={isLocating ? faSpinner : faCrosshairs}
          className={isLocating ? "fa-spin" : ""}
        />
        <span>{isLocating ? "Mencari GPS..." : "Ke Lokasi Saya"}</span>
      </button>

      <MapContainer
        center={position || defaultCoords}
        zoom={position ? 17 : 13}
        attributionControl={false}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "14px",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapLocationController
          position={position}
          setPosition={setPosition}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          flyTarget={flyTarget}
          setFlyTarget={setFlyTarget}
        />
      </MapContainer>
    </div>
  );
}

export default MapPicker;
