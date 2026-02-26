
import { convertSwaggerToDocs } from './lib/swaggerAdapter';
import swaggerSpec from './res/docs/swagger.json';
import { Language, DocSection } from './types';

// --- MANUAL GUIDES CONTENT (MARKDOWN) ---

const GUIDE_INTRODUCTION: DocSection = {
    id: 'intro',
    title: 'Introduction',
    content: `
# Verilocale API Documentation

Verilocale provides a unified AI Identity Verification platform tailored for Southeast Asia. Our API enables you to perform **OCR (Optical Character Recognition)** on local ID documents, **Passive Liveness Detection**, and **Face Recognition** with banking-grade security and localized accuracy.

## Key Features

*   **Deep Localization**: Specialized models for Thai, Vietnamese, Indonesian, and Malay scripts and document layouts.
*   **Passive Liveness**: Single-frame anti-spoofing certified for ISO 30107-3.
*   **High Performance**: Average latency < 500ms for OCR, < 200ms for Face Match.
*   **Data Sovereignty**: Options for regional routing to comply with PDPA/GDPR.

## Base URL

All API requests should be made to the following base URL:

\`\`\`
https://api.verilocale.com/v1
\`\`\`
    `,
    subsections: []
};

const GUIDE_AUTHENTICATION: DocSection = {
    id: 'authentication',
    title: 'Authentication',
    content: `
# Authentication

Verilocale API uses **Bearer Token** authentication. You must include your API Key in the \`Authorization\` header of every request.

## Obtaining an API Key

1.  Log in to the [Developer Console](/console).
2.  Navigate to **Credentials**.
3.  Click **Create New Key**.
4.  Select the required scopes (e.g., \`ocr:read\`, \`face:read\`).
5.  Copy the generated secret key immediately. It will not be shown again.

## Using the Key

Pass the key in the HTTP Header:

\`\`\`bash
Authorization: Bearer <YOUR_API_KEY>
\`\`\`

> **Security Note:** Never expose your API Key in client-side code (browsers, mobile apps). Always route requests through your own backend server.

## Scopes

Keys can be restricted to specific capabilities:

*   \`ocr:read\`: Permission to analyze documents.
*   \`liveness:read\`: Permission to perform liveness checks.
*   \`face:read\`: Permission to compare or detect faces.
*   \`face:write\`: Permission to enroll faces into the search database.
    `,
    subsections: []
};

const GUIDE_QUICKSTART: DocSection = {
    id: 'quickstart',
    title: 'Quickstart',
    content: `
# Quickstart Guide

This guide will walk you through your first API call to extract data from a Thai National ID card.

## Prerequisites

*   An active API Key.
*   An image of a Thai ID card (JPG/PNG).

## Step 1: Prepare the Request

We will use the \`/kyc/ocr\` endpoint. It accepts \`multipart/form-data\`.

## Step 2: Make the Call (cURL)

\`\`\`bash
curl -X POST https://api.verilocale.com/v1/kyc/ocr \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "picture=@/path/to/thai_id.jpg" \\
  -F "type=id_card" \\
  -F "country=th"
\`\`\`

## Step 3: Handle the Response

You will receive a JSON response containing the extracted fields:

\`\`\`json
{
  "code": 200,
  "message": "success",
  "data": {
    "parsing_results": {
      "id_number": { "text": "1 1005 01234 56 7", "confidence": 0.99 },
      "name_th": { "text": "นาย สมมติ", "confidence": 0.98 },
      "date_of_birth": { "text": "2535-05-20", "confidence": 0.99 }
    }
  }
}
\`\`\`
    `,
    subsections: []
};

const GUIDE_FAQ: DocSection = {
    id: 'faq',
    title: 'FAQ',
    content: `
# Frequently Asked Questions

### What file formats are supported?
We support JPG, PNG, WEBP, and BMP. We recommend using JPG with 85% quality compression for the best balance of speed and accuracy.

### What is the maximum file size?
The maximum file size for image uploads is **10MB**.

### How do I handle rate limits?
Standard plans allow 10 requests per second (RPS). If you exceed this, you will receive a \`429 Too Many Requests\` response. We recommend implementing exponential backoff in your application.

### Is my data stored?
By default, Verilocale does **not** store PII (Personally Identifiable Information) from OCR or Face Verification requests after processing is complete. We only store transaction metadata (timestamp, status) for billing and audit logs.
    `,
    subsections: []
};

// --- MERGE LOGIC ---

// Helper to get docs, fallback to English if specific trans not implemented for Swagger text
const swaggerDocs = convertSwaggerToDocs(swaggerSpec);

// Combine Manual Guides + Swagger Generated Docs
const fullDocs: DocSection[] = [
    GUIDE_INTRODUCTION,
    GUIDE_AUTHENTICATION,
    GUIDE_QUICKSTART,
    ...swaggerDocs, // Insert Swagger docs (OCR, Face, etc) here
    GUIDE_FAQ
];

export const DOCS_DATA: Record<Language, DocSection[]> = {
    en: fullDocs,
    th: fullDocs, // In a real app, you'd translate the static guides above
    zh: fullDocs,
    vi: fullDocs,
    id: fullDocs,
    ms: fullDocs,
    tl: fullDocs,
    my: fullDocs
};
