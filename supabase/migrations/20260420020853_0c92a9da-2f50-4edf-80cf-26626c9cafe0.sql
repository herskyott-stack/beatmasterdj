CREATE OR REPLACE FUNCTION public.bulk_insert_lesson_quizzes(_payload jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lesson_rec jsonb;
  q_rec jsonb;
  a_rec jsonb;
  new_question_id uuid;
  q_order integer;
  a_order integer;
  cnt integer := 0;
BEGIN
  FOR lesson_rec IN SELECT * FROM jsonb_array_elements(_payload) LOOP
    q_order := 1;
    FOR q_rec IN SELECT * FROM jsonb_array_elements(lesson_rec->'questions') LOOP
      INSERT INTO public.lesson_questions (lesson_id, question_text, explanation, question_type, question_order)
      VALUES (
        (lesson_rec->>'lesson_id')::uuid,
        q_rec->>'question_text',
        COALESCE(q_rec->>'explanation', ''),
        'multiple_choice',
        q_order
      )
      RETURNING id INTO new_question_id;

      a_order := 1;
      FOR a_rec IN SELECT * FROM jsonb_array_elements(q_rec->'answers') LOOP
        INSERT INTO public.lesson_answers (question_id, answer_text, is_correct, display_order)
        VALUES (
          new_question_id,
          a_rec->>'answer_text',
          COALESCE((a_rec->>'is_correct')::boolean, false),
          a_order
        );
        a_order := a_order + 1;
      END LOOP;

      q_order := q_order + 1;
      cnt := cnt + 1;
    END LOOP;
  END LOOP;
  RETURN cnt;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_insert_lesson_quizzes(jsonb) TO anon, authenticated;