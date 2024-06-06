const { default: axios } = require("axios");

const getClientIp = async (req) => {
    const xForwardedFor = req.headers['x-forwarded-for'];
    const clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : '103.71.47.193';
    try {
      const response = await axios.get(`https://proxycheck.io/v2/${clientIp}?vpn=1&asn=1`);
      const data = response.data;
  
      return {
        ip: clientIp,
        proxy: data[clientIp]?.proxy || 'nod',
        country: data[clientIp]?.country || 'noLand'
      };
    } catch (error) {
        console.log(error)
      return {
        ip: clientIp,
        proxy: 'nod',
        country:  'noLand'
      };
    }
  };

  module.exports = getClientIp