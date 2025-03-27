const isWithinGeofence = (userLat, userLng, officeLat, officeLng, radius = 150) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters

  const dLat = toRad(userLat - officeLat);
  const dLng = toRad(userLng - officeLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(officeLat)) * Math.cos(toRad(userLat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in meters

  console.log(`Calculated distance: ${distance} meters, Allowed Radius: ${radius} meters`);

  return distance <= radius;
};

  module.exports = isWithinGeofence;