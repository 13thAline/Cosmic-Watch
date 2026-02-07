import axios from "axios"

const API_KEY = import.meta.env.VITE_NASA_API_KEY

export async function fetchAsteroids() {
  const res = await axios.get(
    `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${API_KEY}`
  )
  return res.data.near_earth_objects
}
