async function checkDetails() {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJiwLjuXXRwxUR9zR13OUp-ws`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Result without key:', data);
}

checkDetails();
