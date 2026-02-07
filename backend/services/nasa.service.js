const axios = require("axios");

const NASA_BASE_URL="https://api.nasa.gov/neo/rest/v1"

const getAsteroidById = async(asteroidId) => {
    const response = await axios.get(
        `${NASA_BASE_URL}/neo/${asteroidId}`,
        {
            params: {
                api_Key:process.env.NASA_API_KEY
            }
        }
    );
    return response.data;
}
module.exports = {getAsteroidById};