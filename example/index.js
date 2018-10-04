const aws_iot = require('aws-iot-device-sdk')
const ThingRegistry = require('sensor.live-things-registry')
const config = {
    aws_iot: {
        endpoint: 'your aws iot endpoint',
        port: '8883', // 8883 or 1883 is default supported with AWS IoT,
        debug: false
    }
}
const thing_registry = new ThingRegistry()
let thing_registry.setCertsPath('./certs') // you can change the default certificates folder
if (!thing_registry.hasDeviceCertificate()) {
    thing_registry.generateDeviceCertificate()
}
let thing_name = thing_registry.getThingName()
let keys_path = thing_registry.getKeysPath()
let client_id = `device-${thing_name}`
let thing_shadow = aws_iot.thingShadow({
    ...keys_path,
    host: config.aws_iot.endpoint,
    port: config.aws_iot.port,
    debug: config.aws_iot.debug,
    clientId: client_id
})