-- Add WJEC as a supported exam board and seed its A-level Biology (1400)
-- syllabus. Topic names are drawn from the official WJEC GCE Biology
-- specification (units 1-4; unit 5 is internally-assessed practical work
-- with no fixed content list, so it is not seeded here).

alter table profiles drop constraint profiles_exam_board_check;
alter table profiles add constraint profiles_exam_board_check
  check (exam_board in ('AQA', 'OCR', 'Edexcel', 'WJEC'));

alter table syllabus_topics drop constraint syllabus_topics_exam_board_check;
alter table syllabus_topics add constraint syllabus_topics_exam_board_check
  check (exam_board in ('AQA', 'OCR', 'Edexcel', 'WJEC'));

do $$
declare
  unit_id uuid;
begin
  -- Unit 1: Basic Biochemistry and Cell Organisation
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('WJEC', '1', 'Basic Biochemistry and Cell Organisation', 1) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('WJEC', '1.1', 'Chemical elements joined to form biological compounds', unit_id, 1),
    ('WJEC', '1.2', 'Cell structure and organisation', unit_id, 2),
    ('WJEC', '1.3', 'Cell membranes and transport', unit_id, 3),
    ('WJEC', '1.4', 'Biological reactions are regulated by enzymes', unit_id, 4),
    ('WJEC', '1.5', 'Nucleic acids and their functions', unit_id, 5),
    ('WJEC', '1.6', 'Genetic information is copied and passed on to daughter cells', unit_id, 6);

  -- Unit 2: Biodiversity and Physiology of Body Systems
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('WJEC', '2', 'Biodiversity and Physiology of Body Systems', 2) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('WJEC', '2.1', 'All organisms are related through their evolutionary history', unit_id, 1),
    ('WJEC', '2.2', 'Adaptations for gas exchange', unit_id, 2),
    ('WJEC', '2.3', 'Adaptations for transport', unit_id, 3),
    ('WJEC', '2.4', 'Adaptations for nutrition', unit_id, 4);

  -- Unit 3: Energy, Homeostasis and the Environment
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('WJEC', '3', 'Energy, Homeostasis and the Environment', 3) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('WJEC', '3.1', 'Importance of ATP', unit_id, 1),
    ('WJEC', '3.2', 'Photosynthesis uses light energy to synthesise organic molecules', unit_id, 2),
    ('WJEC', '3.3', 'Respiration releases chemical energy in biological processes', unit_id, 3),
    ('WJEC', '3.4', 'Microbiology', unit_id, 4),
    ('WJEC', '3.5', 'Population size and ecosystems', unit_id, 5),
    ('WJEC', '3.6', 'Human impact on the environment', unit_id, 6),
    ('WJEC', '3.7', 'Homeostasis and the kidney', unit_id, 7),
    ('WJEC', '3.8', 'The nervous system', unit_id, 8);

  -- Unit 4: Variation, Inheritance and Options
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('WJEC', '4', 'Variation, Inheritance and Options', 4) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('WJEC', '4.1', 'Sexual reproduction in humans', unit_id, 1),
    ('WJEC', '4.2', 'Sexual reproduction in plants', unit_id, 2),
    ('WJEC', '4.3', 'Inheritance', unit_id, 3),
    ('WJEC', '4.4', 'Variation and evolution', unit_id, 4),
    ('WJEC', '4.5', 'Application of reproduction and genetics', unit_id, 5),
    ('WJEC', '4.6', 'Option: Immunology and Disease', unit_id, 6),
    ('WJEC', '4.7', 'Option: Human Musculoskeletal Anatomy', unit_id, 7),
    ('WJEC', '4.8', 'Option: Neurobiology and Behaviour', unit_id, 8);
end $$;
