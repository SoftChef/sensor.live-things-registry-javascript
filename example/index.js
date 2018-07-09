const aws_iot = require('aws-iot-device-sdk');
const thing_registry = require('sensor.live-things-registry');
const config = require('dotenv').config();

const main = async () => {
    thing_registry.setCertsPath('./certs');
    if (!thing_registry.hasDeviceCertificate()) {
        thing_registry.generateDeviceCertificate({
            // thing_name: 'if you have thing name, you can set this property. Or use a unique name with your device private key'
        });
    }
    let thing_name = thing_registry.getThingName();
    let keys_path = thing_registry.getKeysPath();
    let client_id = `device-${thing_name}`
    let thing_shadow = aws_iot.thingShadow({
        ...keys_path,
        host: process.env.AWS_IOT_HOST,
        port: process.env.AWS_IOT_PORT,
        debug: process.env.AWS_IOT_DEBUG === 'true',
        clientId: client_id
    });
};

main();