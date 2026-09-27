# MEB Sorumluluk Sınavları Yönetim Sistemi

React and Vite application for managing responsibility exams, assignments, and printable reports.

## Run locally

Requirements: Node.js 20 or newer.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; preview it locally with `npm run preview`.

## Data and privacy

- The repository starts with empty school, teacher, student, course, room, and exam data. Enter school information and import only data you are authorized to use.
- Application data is saved in the current browser's local storage. It is not shared with other users or devices.
- Use the application's JSON backup and store that file securely. Do not commit backups or school/student/personnel spreadsheets.
- Do not publish this client-side application to a public URL with real school data. A private source repository does not make a deployed website private. Restrict access at the hosting layer before using real data.
- Access database files, source spreadsheets, exports, generated reports, and local build/dependency folders are excluded by `.gitignore`.

## Deployment

This repository contains the application source. Select an authenticated hosting provider and configure access restrictions before deploying it for school use. Static hosting alone does not provide shared storage or user authentication.
