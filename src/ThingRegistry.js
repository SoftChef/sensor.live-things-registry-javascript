const fs = require('fs')
const Buffer = require('buffer').Buffer
const key_generator = require('./KeyGenerator')

class ThingRegistry {
    constructor() {
        this.certs_path = './certs'
        this.root_ca_certificate = 'root_ca.cert.pem'
        this.ca_certificate = 'ca.cert.pem'
        this.ca_private_key = 'ca.private_key.pem'
        this.device_csr = 'device.csr'
        this.device_certificate = 'device.cert.pem'
        this.device_public_key = 'device.public_key.pem'
        this.device_private_key = 'device.private_key.pem'
    }
    setCertsPath(path) {
        this.certs_path = path
    }
    setCACertificateName(name) {
        this.ca_certificate = name
    }
    setCAPrivateKeyName(name) {
        this.ca_private_key = name
    }
    setRootCACertificateName(name) {
        this.root_ca_certificate = name
    }
    setDeviceCsrName(name) {
        this.device_csr = name
    }
    setDeviceCertificateName(name) {
        this.device_certificate = name
    }
    setDevicePublicKeyName(name) {
        this.device_public_key = name
    }
    setDevicePrivateKeyName(name) {
        this.device_private_key = name
    }
    checkRootCACertificateFile() {
        return fs.existsSync(
            this.getRootCACertificatePath()
        )
    }
    checkCACertificateFile() {
        return fs.existsSync(
            this.getCACertificatePath()
        )
    }
    checkCAPrivateKeyFile() {
        return fs.existsSync(
            this.getCAPrivateKeyPath()
        )
    }
    hasDeviceCertificate() {
        return fs.existsSync(
            this.getDeviceCertificatePath()
        )
    }
    generateDeviceCertificate({ thing_name = null, country_name = 'TW', state_name = 'Taipei', locality_name = 'Nangang', organization_name = 'SoftChef', organization_unit_name = 'IT'}) {
        if (!this.checkCACertificateFile() || !this.checkCAPrivateKeyFile()) {
            throw `${this.ca_certificate} or ${this.ca_private_key} file not founded.`
        }
        let ca_certificate_path = `${this.certs_path}/${this.ca_certificate}`
        let ca_private_key_path = `${this.certs_path}/${this.ca_private_key}`
        let device_public_key = null
        let device_private_key = null
        let device_csr = null
        if (fs.existsSync(this.getDevicePublicKeyPath()) && fs.existsSync(this.getDevicePrivateKeyPath())) {
            if (!fs.existsSync(this.getDeviceCsrPath())) {
                let device_public_key = fs.readFileSync(
                    this.getDevicePublicKeyPath()
                )
                let device_private_key = fs.readFileSync(
                    this.getDevicePrivateKeyPath()
                )
                device_csr = key_generator.generateDeviceCsr(device_public_key, device_private_key, thing_name, country_name, state_name, locality_name, organization_name, organization_unit_name)
                fs.writeFileSync(this.getDeviceCsrPath(), device_csr)
            } else {
                device_csr = fs.readFileSync(
                    this.getDeviceCsrPath()
                )
            }
        } else {
            let key_pair = key_generator.generateDeviceKeyPair()
            device_csr = key_generator.generateDeviceCsr(key_pair.public_key, key_pair.private_key, thing_name, country_name, state_name, locality_name, organization_name, organization_unit_name)
            fs.writeFileSync(this.getDevicePublicKeyPath(), key_pair.public_key)
            fs.writeFileSync(this.getDevicePrivateKeyPath(), key_pair.private_key)
            fs.writeFileSync(this.getDeviceCsrPath(), device_csr)
        }
        let device_certificate = key_generator.generateDeviceCertificate(ca_certificate_path, ca_private_key_path, device_csr)
        fs.writeFileSync(this.getDeviceCertificatePath(), device_certificate)
    }
    getThingName() {
        let device_certificate_pem = fs.readFileSync(
            this.getDeviceCertificatePath()
        ).toString()
        let common_name = key_generator.getCommonName(device_certificate_pem)
        if (common_name) {
            return common_name
        }
        let lines = device_certificate_pem.split('\n')
        let base64_pem = new Buffer(
            lines.slice(1, lines.indexOf('-----END CERTIFICATE-----\r') - 1).toString()
        , 'base64').toString('hex')
        let prefix = '301d0603551d0e04160414'
        return base64_pem.substr(base64_pem.indexOf(prefix) + prefix.length, 40)
    }
    getKeysPath() {
        return {
            keyPath: this.getDevicePrivateKeyPath(),
            certPath: this.getDeviceCertificatePath(),
            caPath: this.getRootCACertificatePath()
        }
    }
    getRootCACertificatePath() {
        return `${this.certs_path}/${this.root_ca_certificate}`
    }
    getCACertificatePath() {
        return `${this.certs_path}/${this.ca_certificate}`
    }
    getCAPrivateKeyPath() {
        return `${this.certs_path}/${this.ca_private_key}`
    }
    getDeviceCsrPath() {
        return `${this.certs_path}/${this.device_csr}`
    }
    getDeviceCertificatePath() {
        return `${this.certs_path}/${this.device_certificate}`
    }
    getDeviceCsrPath() {
        return `${this.certs_path}/${this.device_csr}`
    }
    getDevicePublicKeyPath() {
        return `${this.certs_path}/${this.device_public_key}`
    }
    getDevicePrivateKeyPath() {
        return `${this.certs_path}/${this.device_private_key}`
    }
}

module.exports = ThingRegistry