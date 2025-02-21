# Student Management System

## Introduction
A command-line Student Management System built with Node.js that provides comprehensive functionality for managing student records. The system enables administrators to perform CRUD operations (Create, Read, Update, Delete) on student data through console interface.

## Features
![Menu Interface](./screenshots/menu.jpg)
- **Add Student**: Create new student records with detailed information
  - Name, Student ID
  - Date of Birth
  - Gender
  - Department/Major
  - Contact Information
![Add Student Interface](./screenshots/add-student.jpg)
- **Update Student**: Modify existing student information
  - Update any field
  - Validation of input data
  - Confirmation before changes
![Update Student Interface](./screenshots/update-student.jpg)
- **Remove Student**: Delete student records
  - Remove by Student ID
![Remove Student Interface](./screenshots/remove-student.jpg)
- **Search Functionality**:
  - Search by Student ID
  - Search by Student Name
![Search Student Interface](./screenshots/search-student.jpg)
- **Display Options**:
  - View all students
![Display List Student Interface](./screenshots/display-list.jpg)
## Project Structure
```
Student_ID/
│
├── studentManager.js   # Main application logic
│
└── README.md             # Project documentation
```

## Requirements
- Node.js (version 14.0.0 or higher)

## Installation

1. Ensure Node.js is installed on your system:
   ```bash
   node -v
   ```

2. Navigate to the project directory

3. Start the application:
   ```bash
   node student-management.js
   ```
