const forge = require('node-forge')
const fs = require('fs')

class KeyGenerator {
    generateDeviceKeyPair() {
        let keys = forge.pki.rsa.generateKeyPair(2048)
        let key_pair = {
            private_key: forge.pki.privateKeyToPem(keys.privateKey),
            public_key: forge.pki.publicKeyToPem(keys.publicKey),
        }
        return key_pair
    }
    generateDeviceCsr(public_key, private_key, thing_name, country_name, state_name, locality_name, organization_name, organization_unit_name) {
        let csr = forge.pki.createCertificationRequest()
        csr.publicKey = forge.pki.publicKeyFromPem(public_key)
        csr.setSubject([{
            name: 'commonName',
            value: thing_name || 'sensor.live'
        }, {
            name: 'countryName',
            value: country_name
        }, {
            shortName: 'ST',
            value: state_name
        }, {
            name: 'localityName',
            value: locality_name
        }, {
            name: 'organizationName',
            value: organization_name
        }, {
            shortName: 'OU',
            value: organization_unit_name
        }])
        // add optional attributes
        csr.setAttributes([{
            name: 'unstructuredName',
            value: 'SoftChef'
        }])
        // sign certification request
        csr.sign(forge.pki.privateKeyFromPem(private_key), forge.md.sha256.create())
        // PEM-format keys and csr
        return forge.pki.certificationRequestToPem(csr)
    }
    generateDeviceCertificate(ca_certificate_path, ca_key_path, device_csr_pem) {
        let ca_certificate_pem = fs.readFileSync(ca_certificate_path, 'utf8')
        let ca_key_pem = fs.readFileSync(ca_key_path, 'utf8')
        let ca_certificate = forge.pki.certificateFromPem(ca_certificate_pem)
        let ca_key = forge.pki.privateKeyFromPem(ca_key_pem)
        let device_csr = forge.pki.certificationRequestFromPem(device_csr_pem)
        let certificate = forge.pki.createCertificate()
        certificate.validity.notBefore = new Date()
        certificate.validity.notAfter = new Date()
        certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 25)
        certificate.setSubject(device_csr.subject.attributes)
        certificate.setIssuer(ca_certificate.subject.attributes)
        certificate.publicKey = device_csr.publicKey
        certificate.setExtensions([{
            name: 'basicConstraints',
            CA: false
        }, {
            name: 'subjectKeyIdentifier'
        }, {
            name: 'authorityKeyIdentifier',
            keyIdentifier: true
        }])
        certificate.sign(ca_key, forge.md.sha256.create())
        return forge.pki.certificateToPem(certificate) + forge.pki.certificateToPem(ca_certificate)
    }
    getCommonName(device_certificate_pem) {
        let device_certificate = forge.pki.certificateFromPem(device_certificate_pem)
        let field = device_certificate.subject.getField('CN') || {}
        let common_name = field.value || null
        if (common_name && common_name !== 'sensor.live') {
            return common_name
        } else {
            return null
        }
    }
}

module.exports = new KeyGenerator