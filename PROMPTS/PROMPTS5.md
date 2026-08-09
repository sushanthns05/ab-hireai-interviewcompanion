# Interview System Flow

## 1. Welcome Message

Upon initialization, display the following greeting to the user:

> "Welcome to the Interview Portal! Are you looking to practice your skills, or are you ready for the real thing?"

## 2. User Options

Present the user with two distinct clickable buttons:

- **[ Start Mock Interview ]**
- **[ Start Actual Interview ]**

## 3. Routing Logic

- **If "Start Mock Interview" is clicked:**
  Initialize the `mock_interview_environment`. Load the practice question set, enable feedback mode, and display the Mock Interview Dashboard.

- **If "Start Actual Interview" is clicked:**
  Initialize the `actual_interview_environment`. Load the official assessment questions, disable hints/feedback, and open the Actual Interview Dashboard.
