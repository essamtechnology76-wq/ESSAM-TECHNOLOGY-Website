# ESSAM TECHNOLOGY Website

A responsive, static business website for ESSAM TECHNOLOGY, built with plain HTML, CSS and JavaScript for GitHub Pages.

## Website sections

- Home and brand introduction
- About ESSAM TECHNOLOGY
- Services
- Selected work / project concepts
- Project enquiry form
- Partner registration
- Marketer registration
- General contact form
- Privacy policy and terms
- Marketer payout information page

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Google Apps Script Web App for form submissions
- Google Sheets as the submissions database

## Form endpoint

The website currently posts form submissions to the ESSAM TECHNOLOGY Google Apps Script Web App configured in \`script.js\`.

Supported form types in the front end:
- \`order\`
- \`partner\`
- \`marketer\`
- \`contact\`

The browser uses a \`no-cors\` request to avoid a preflight request to Apps Script. This means the browser cannot read the server's response; the success message indicates that the request was sent from the browser, not that a row was independently verified in Google Sheets. Test each form against the live spreadsheet before accepting public submissions.

## Important production checklist

- Confirm GitHub Pages is publishing from the \`main\` branch and repository root.
- Test each form and confirm that its fields map to the correct Google Sheets columns.
- Add stronger abuse protection and server-side validation to the public Apps Script endpoint.
- Do not collect bank account details through the public website until the payout flow has additional verification and protection.
- Configure the final website URL in Apps Script before enabling referral-link generation.
- Add the approved brand portrait, logo artwork and final portfolio images when available.
- Review the privacy policy and terms for the business's actual practices and applicable law.

## Contact

ESSAM TECHNOLOGY  
Email: essamtechnology76@gmail.com  
WhatsApp: +234 902 660 1873  
