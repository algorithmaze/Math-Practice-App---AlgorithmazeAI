# Database Schema (MongoDB)

This document outlines the collections and their fields for the MathMaster application.

## 1. `users`

Stores information about registered students.

*   `_id`: ObjectId (Primary Key)
*   `username`: String (Unique, Indexed) - For login
*   `email`: String (Unique, Indexed) - For communication, password recovery
*   `password_hash`: String - Hashed password
*   `createdAt`: Date - Timestamp of account creation
*   `updatedAt`: Date - Timestamp of last update

## 2. `syllabus_units`

Defines the main units of the CBSE Class 10 Mathematics syllabus.

*   `_id`: ObjectId (Primary Key)
*   `unit_name`: String (Unique) - e.g., "Algebra", "Geometry", "Trigonometry"
*   `description`: String (Optional) - Brief overview of the unit
*   `order`: Number - To maintain a specific order of units if needed
*   `createdAt`: Date
*   `updatedAt`: Date

## 3. `topics`

Defines specific topics within each syllabus unit.

*   `_id`: ObjectId (Primary Key)
*   `topic_name`: String - e.g., "Polynomials", "Quadratic Equations", "Circles"
*   `description`: String (Optional) - Brief overview of the topic
*   `unit_id`: ObjectId (References `syllabus_units._id`, Indexed)
*   `order`: Number - To maintain a specific order of topics within a unit
*   `createdAt`: Date
*   `updatedAt`: Date

## 4. `questions`

Stores all the questions for the application.

*   `_id`: ObjectId (Primary Key)
*   `question_text`: String - The main text of the question. Can include KaTeX for formulas.
*   `question_type`: String (Enum: "MCQ", "ASSERTION_REASONING", "CASE_STUDY", "IMAGE_BASED", "TEXT_INPUT") - Type of question.
    *   `MCQ`: Multiple Choice Question
    *   `ASSERTION_REASONING`: Assertion and Reasoning type
    *   `CASE_STUDY`: A paragraph/scenario followed by sub-questions (sub-questions might be individual `questions` documents linked to a parent case study ID, or structured within this document)
    *   `IMAGE_BASED`: Question primarily based on an image.
    *   `TEXT_INPUT`: Questions requiring a short text/numerical answer.
*   `options`: Array of Objects (Only for `MCQ`)
    *   `text`: String - Option text (can include KaTeX)
    *   `is_correct`: Boolean - Indicates if this is the correct option
*   `answer`: Object (For non-MCQ types)
    *   `correct_answer_text`: String (For `TEXT_INPUT`, `ASSERTION_REASONING`) - The correct answer or key aspects of it.
    *   `explanation`: String - Detailed explanation of how to arrive at the correct answer.
*   `difficulty_level`: String (Enum: "EASY", "MEDIUM", "HARD", Indexed)
*   `topic_id`: ObjectId (References `topics._id`, Indexed)
*   `image_url`: String (Optional, for `IMAGE_BASED`) - URL to the image if static, or could be generated.
*   `image_prompt`: String (Optional, for `IMAGE_BASED` if image is to be AI-generated) - Prompt for generating the image.
*   `case_study_id`: ObjectId (Optional, References `case_studies._id` if `CASE_STUDY` questions are linked to a parent case study document)
*   `marks`: Number (Optional) - Marks allocated for the question, if applicable.
*   `tags`: Array of String (Optional) - For finer-grained categorization (e.g., "Pythagoras Theorem", "Linear Equations in Two Variables")
*   `createdAt`: Date
*   `updatedAt`: Date

## 5. `case_studies` (Optional, an alternative for structuring case studies)

Stores the main text for case studies if they are treated as parent documents.

*   `_id`: ObjectId (Primary Key)
*   `case_study_text`: String - The descriptive paragraph or scenario for the case study.
*   `topic_id`: ObjectId (References `topics._id`, Indexed)
*   `source`: String (Optional) - e.g., "CBSE Sample Paper 2023"
*   `createdAt`: Date
*   `updatedAt`: Date
    *Note: If using this approach, `questions` of type `CASE_STUDY` would link here via `case_study_id` and represent sub-questions.*

## 6. `student_progress`

Tracks the progress of each student per topic.

*   `_id`: ObjectId (Primary Key)
*   `user_id`: ObjectId (References `users._id`, Indexed)
*   `topic_id`: ObjectId (References `topics._id`, Indexed)
*   `current_difficulty_level`: String (Enum: "EASY", "MEDIUM", "HARD") - Current difficulty student is attempting for this topic.
*   `consecutive_wrong_answers`: Number (Default: 0) - Count of consecutive incorrect answers for the current difficulty.
*   `questions_attempted_at_current_difficulty`: Number (Default: 0) - Number of questions attempted at the current difficulty level in the current session/streak.
*   `correct_in_a_row_current_difficulty`: Number (Default: 0) - Number of questions answered correctly in a row at current difficulty.
*   `last_attempted_question_id`: ObjectId (References `questions._id`, Optional)
*   `topic_mastery_score`: Number (Optional, 0-100) - An overall mastery score for the topic.
*   `history`: Array of Objects (Optional) - To store history of questions answered.
    *   `question_id`: ObjectId
    *   `answered_correctly`: Boolean
    *   `timestamp`: Date
    *   `difficulty_when_answered`: String
*   `createdAt`: Date
*   `updatedAt`: Date

## 7. `tips_and_tricks`

Stores mathematical tips and tricks.

*   `_id`: ObjectId (Primary Key)
*   `tip_text`: String - The content of the tip or trick.
*   `category`: String (Optional, e.g., "Algebra", "Geometry", "Exam Strategy") - Can be linked to units or topics.
*   `topic_ids`: Array of ObjectId (Optional, References `topics._id`) - Specific topics this tip relates to.
*   `unit_ids`: Array of ObjectId (Optional, References `syllabus_units._id`) - Specific units this tip relates to.
*   `source`: String (Optional)
*   `createdAt`: Date
*   `updatedAt`: Date

## Relationships:

*   A `syllabus_unit` has many `topics`.
*   A `topic` belongs to one `syllabus_unit` and has many `questions`.
*   A `user` has many `student_progress` records (one per topic they interact with).
*   A `question` belongs to one `topic`.
*   `tips_and_tricks` can be general or linked to specific `topics` or `syllabus_units`.

This schema provides a robust foundation for the application's data requirements.
I've added a `TEXT_INPUT` question type for more flexibility and refined the `student_progress` to better track the difficulty adjustment logic. I also considered a separate `case_studies` collection.
