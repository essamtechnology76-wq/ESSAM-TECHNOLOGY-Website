ESSAM TECHNOLOGY — Customer Enquiry Website

FILES
- index.html: the webpage structure
- style.css: layout and styling
- script.js: form validation and Google Sheets connection

GOOGLE SHEETS CONNECTION
The script.js file is already configured with the Apps Script Web App URL supplied for this project.

IMPORTANT
The current Apps Script backend expects JSON in e.postData.contents. The website sends a JSON POST using text/plain and no-cors to avoid a browser CORS preflight. Because no-cors responses are opaque, the page cannot verify the server's response body. After uploading, test with a sample enquiry and check the "Enquiries" tab in your Google Sheet.

UPLOAD
Upload all three files together into the root of your GitHub repository. Keep the filenames exactly as shown. Enable GitHub Pages from the repository's Settings > Pages, using the main branch and root folder.

If you edit or redeploy the Apps Script later, update SCRIPT_URL in script.js if the deployment URL changes.
