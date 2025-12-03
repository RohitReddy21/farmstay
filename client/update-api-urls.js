// Helper script to update API URLs for production
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'https://your-backend-url.onrender.com';

const filesToUpdate = [
    'src/context/AuthContext.jsx',
    'src/pages/Admin.jsx',
    'src/pages/Database.jsx',
    'src/pages/FarmDetails.jsx',
    'src/pages/Farms.jsx',
    'src/pages/Login.jsx',
    'src/pages/Register.jsx'
];

console.log(`Updating API URLs to: ${BACKEND_URL}`);

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);

    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace localhost URLs with backend URL
        content = content.replace(/http:\/\/localhost:5000/g, BACKEND_URL);

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated ${file}`);
    } else {
        console.log(`✗ File not found: ${file}`);
    }
});

console.log('\nDone! API URLs updated.');
console.log('Remember to update BACKEND_URL environment variable before running this script.');
