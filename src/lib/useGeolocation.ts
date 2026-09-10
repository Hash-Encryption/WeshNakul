export interface Coordinates {
  lat: number;
  lng: number;
}

export function getHostCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('geolocation_unsupported'));
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
        const reason = error.code === 1
          ? 'geolocation_permission_denied'
          : error.code === 3
            ? 'geolocation_timeout'
            : 'geolocation_unavailable';
        reject(new Error(reason));
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  });
}
