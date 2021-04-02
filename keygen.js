var forge = require('node-forge');
var fs = require('fs');

console.log('Generating 2048-bit key-pair...');
var keys = forge.pki.rsa.generateKeyPair(2048);
console.log('Key-pair created.');

console.log('Creating self-signed certificate...');
var cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
var month = cert.validity.notBefore.getMonth();
cert.validity.notAfter.setMonth(month == 12 ? 0 : month + 1);
var attrs = [{
  name: 'commonName',
  value: 'localhost'
}];
var extensions = [{
    name: 'basicConstraints',
    cA: true
}, {
    name: 'subjectKeyIdentifier'
}, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }]
}];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions(extensions);
// self-sign certificate
cert.sign(keys.privateKey, forge.md.sha256.create());
console.log('Certificate created.');

// PEM-format keys and cert
var pem = {
  privateKey: forge.pki.privateKeyToPem(keys.privateKey),
  publicKey: forge.pki.publicKeyToPem(keys.publicKey),
  certificate: forge.pki.certificateToPem(cert)
};

var p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, cert, null);
var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
var p12b64 = forge.util.encode64(p12Der);

console.log('\nKey-Pair:');
console.log(pem.privateKey);
console.log(pem.publicKey);

console.log('\nCertificate:');
console.log(pem.certificate);

// verify certificate
var caStore = forge.pki.createCaStore();
caStore.addCertificate(cert);
try {
  forge.pki.verifyCertificateChain(caStore, [cert],
    function(vfd, depth, chain) {
      if(vfd === true) {
        console.log('SubjectKeyIdentifier verified: ' +
          cert.verifySubjectKeyIdentifier());
        console.log('Certificate verified.');
      }
      return true;
    });
} catch(ex) {
  console.log('Certificate verification failure: ' +
    JSON.stringify(ex, null, 2));
}

fs.writeFileSync('cert.pfx', p12b64);
fs.writeFileSync('cert.pem', pem.certificate);
fs.writeFileSync('key.pem', pem.privateKey);

console.log("Add the cert.pfx file to Trusted Root Certification Authorities");
