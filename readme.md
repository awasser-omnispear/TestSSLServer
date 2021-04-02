This is a simple node http and ws server which reflects what it is sent back.

To prepare:
    npm install
    npm run keygen

Add the `cert.pfx` file to the Trusted Root Certification Authorities

For windows, simply double click the file.  Keep all options default except for "Place all certificates in the following store."  Browse to "Trusted Root Certification Authorities."

Once this is complete, run `npm start`
Connect to https://localhost:8080
