# DocuExtract

Effortlessly extract cash memo data from images and export it to various formats like **PDF, Excel, Word**, or **JSON**.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Demo](#demo)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Overview

DocuExtract is a simple and beginner-friendly project that allows you to extract cash memo data from images and generate digital documents automatically. It captures shop and customer details, calculates totals, balance, and exports the results in multiple formats.

## Features

- **Image to Data Extraction:** Uses OCR to read text and tables from cash memo images.
- **Multi-format Export:** Generate reports in **PDF, Excel, Word**, or **JSON**.
- **Automated Calculations:** Computes totals, balance, and taxes automatically.
- **Customer & Shop Details:** Captures shop name, address, and customer info.
- **User-Friendly:** Simple workflow: Upload → Extract → Export.
- **Scalable:** Can be extended for invoices, bills, or receipts.

## Tech Stack

- **Frontend:** Next.js
- **Backend:** Node.js / Express
- **OCR:**Google Vision API
- **Document Generation:** `docx`, `exceljs`, `pdf-lib`, `jsPDF`

## Installation

1. Clone the repository:

```bash
git clone https://github.com/kazinayeem/docuextract.git
```
