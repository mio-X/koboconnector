# Privacy Policy

**Effective Date:** September 28, 2026

Mio ("we", "us", or "our") operates the **KoboToolbox Connector for Looker Studio** (the "Connector"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Connector.

By using the Connector, you agree to the collection and use of information in accordance with this policy.

## 1. Information Collection and Data Flow
The Connector acts strictly as a secure passthrough bridge between Google Looker Studio and KoboToolbox API servers. 
- **We DO NOT collect, store, log, or transmit** any of your personal data, form responses, KoboToolbox data, or account details to our own servers.
- **We DO NOT sell or share** your data with any third parties.

## 2. Authentication Data
Any authentication credentials (such as API Tokens, Usernames, or Passwords) that you enter into the Looker Studio configuration screen are handled exclusively by **Google Looker Studio's secure parameter system**. 
- These credentials are encrypted and stored by Google.
- They are transmitted directly from Google's servers to your selected KoboToolbox server to authenticate API requests. 
- The developer of this Connector has absolutely no access to your credentials or the data retrieved using them.

## 3. Data Processing
When you use the Connector to fetch data:
1. Looker Studio makes a request to Google Apps Script.
2. The Google Apps Script executes the Connector code, forwarding your secure credentials to the KoboToolbox API endpoint you specified.
3. The KoboToolbox API returns the requested data back to Google Apps Script.
4. The Connector formats this data and passes it directly into your Looker Studio report.
At no point in this process does data leave the secure environments provided by Google and KoboToolbox.

## 4. Changes to This Privacy Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.

## 5. Contact Us
If you have any questions about this Privacy Policy or require support, please contact us by opening an issue on our official GitHub repository:  
**https://github.com/mio-X/koboconnector/issues**

---

# Terms of Service

**Effective Date:** September 28, 2026

## 1. Acceptance of Terms
By accessing or using the KoboToolbox Connector for Looker Studio (the "Connector"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not use the Connector.

## 2. Service Description
The Connector is a community-developed tool designed to facilitate the transfer of data from KoboToolbox into Google Looker Studio. This Connector is an independent community project and is **not officially affiliated with, endorsed by, or sponsored by KoboToolbox or Google.**

## 3. User Responsibilities
- You are responsible for maintaining the confidentiality of your API keys and credentials.
- You agree to use the Connector in compliance with the KoboToolbox Terms of Service and all applicable local, state, and international data protection regulations (including GDPR where applicable).

## 4. Disclaimer of Warranties
The Connector is provided on an "AS IS" and "AS AVAILABLE" basis. The developer makes no representations or warranties of any kind, express or implied, regarding the operation or availability of the Connector, or the accuracy of the data it retrieves. 

## 5. Limitation of Liability
In no event shall the developer (Mio) be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the Connector.
