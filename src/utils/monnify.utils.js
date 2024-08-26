const axios = require("axios") 
const config = require("./config")

// Function to generate Monnify access token
const generateMonnifyAccessToken = async () => {
  try {
    // Base64 encode the API Key and Secret Key
    const authString = Buffer.from(`${config.monnifyApiKey}:${config.monnifySecretKey}`).toString('base64');

    // Set the headers
    const headers = {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/json',
    };

    // Send the POST request to generate the token
    const response = await axios.post(`${config.monnifyBaseUrl}/api/v1/auth/login`, {}, { headers });

    // Return the access token
    return response.data.responseBody.accessToken;
  } catch (error) {
    throw new Error(`Error generating Monnify access token: ${error.message}`);
  }
};

module.exports = {
    generateMonnifyAccessToken
}
