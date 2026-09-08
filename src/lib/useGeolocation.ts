export interface Coordinates {
  lat: number;
  lng: number;
}

export function getHostCoordinates(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Location permission denied or unavailable:", error.message);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  });
}
