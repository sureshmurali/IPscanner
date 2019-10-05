'use strict';

const http = require('http');

module.exports.wmi = async (event) => {
  // IP address is extracted from the event object.

  // console.log('===============Getting the IP==================');
  // console.log(event["headers"]["X-Forwarded-For"].split(",")[0]);
  // console.log('====================================');
  const receivedIp = event["headers"]["X-Forwarded-For"].split(",")[0];
  return new Promise((resolve, reject) =>  {
    const options = {
      host: 'api.ipstack.com',
      path: `/${receivedIp}?access_key=c88de954ba30df6dff6995d1e29d57de`,
      port: 80,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`statusCode changed: ${res.statusCode}`)
      
      let geoData = [];
      res.on('data', (d) => {
        geoData.push(d);
      });

      res.on('end', () => {
        try {
          geoData = JSON.parse(Buffer.concat(geoData).toString());
          console.log('===============The real response==================');
          console.log(geoData);
          console.log(typeof(geoData));
          console.log('====================================');

          const ipInfo = {
            "ip": geoData.ip,
            "country": geoData.country_name,
            "region": geoData.region_name,
            "city": geoData.city,
            "lat": geoData.latitude,
            "long": geoData.longitude
          };

          const response = {
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            statusCode: res.statusCode,
            body: JSON.stringify(ipInfo),
          };
        
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (e) => {
      console.log('===============Error==================');
      console.log(e);
      console.log('===============Error==================');
      reject(e.message);
    });

    req.end();
  });



  // callback(null, response);

};
