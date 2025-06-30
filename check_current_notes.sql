-- Quick check of current notes in database
SELECT 
  id,
  title,
  images,
  pdf_urls,
  "pdfUrl",
  course_subject,
  academic_year,
  created_at
FROM notes 
ORDER BY created_at DESC 
LIMIT 5;
