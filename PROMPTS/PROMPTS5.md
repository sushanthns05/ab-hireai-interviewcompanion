PROMPTS 05:

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

AI OUTPUT:

I have updated the landing page for you!

Now, when you first load the app, you'll be greeted with a nice Welcome Message and two large, modern button options:

1. Mock Interview: Clicking this will slide into the "Configure Interview" options that you had previously.
2. Real Interview: Clicking this will directly redirect you to the actual interview dashboard (the /dashboard route).

Both buttons follow the premium dark mode aesthetics and feature hover micro-animations to match the rest of the application. Let me know if you want to tweak the design of these options or the welcome message!
