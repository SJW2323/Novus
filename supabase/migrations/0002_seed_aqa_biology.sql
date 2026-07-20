-- Seed AQA A-level Biology (7401/7402) topic list as the default syllabus.
-- Structure: 8 top-level units, each with representative sub-topics.

do $$
declare
  unit_id uuid;
begin
  -- Unit 1: Biological molecules
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('AQA', '3.1', 'Biological molecules', 1) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('AQA', '3.1.1', 'Monomers and polymers', unit_id, 1),
    ('AQA', '3.1.2', 'Carbohydrates', unit_id, 2),
    ('AQA', '3.1.3', 'Lipids', unit_id, 3),
    ('AQA', '3.1.4', 'Proteins', unit_id, 4),
    ('AQA', '3.1.5', 'Nucleic acids', unit_id, 5),
    ('AQA', '3.1.6', 'Enzymes', unit_id, 6),
    ('AQA', '3.1.7', 'Biological membranes', unit_id, 7),
    ('AQA', '3.1.8', 'Cell division, diversity and organisation', unit_id, 8);

  -- Unit 2: Cells
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('AQA', '3.2', 'Cells', 2) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('AQA', '3.2.1', 'Cell structure', unit_id, 1),
    ('AQA', '3.2.2', 'Transport across cell membranes', unit_id, 2),
    ('AQA', '3.2.3', 'Cell recognition and the immune system', unit_id, 3);

  -- Unit 3: Organisms exchange substances with their environment
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('AQA', '3.3', 'Organisms exchange substances with their environment', 3) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('AQA', '3.3.1', 'Surface area to volume ratio', unit_id, 1),
    ('AQA', '3.3.2', 'Gas exchange', unit_id, 2),
    ('AQA', '3.3.3', 'Digestion and absorption', unit_id, 3),
    ('AQA', '3.3.4', 'Mass transport in animals', unit_id, 4),
    ('AQA', '3.3.5', 'Mass transport in plants', unit_id, 5);

  -- Unit 4: Genetic information, variation and relationships between organisms
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('AQA', '3.4', 'Genetic information, variation and relationships between organisms', 4) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('AQA', '3.4.1', 'DNA, genes and chromosomes', unit_id, 1),
    ('AQA', '3.4.2', 'DNA and protein synthesis', unit_id, 2),
    ('AQA', '3.4.3', 'Genetic diversity from meiosis and random fertilisation', unit_id, 3),
    ('AQA', '3.4.4', 'Genetic diversity and adaptation', unit_id, 4),
    ('AQA', '3.4.5', 'Species and taxonomy', unit_id, 5),
    ('AQA', '3.4.6', 'Biodiversity within a community', unit_id, 6),
    ('AQA', '3.4.7', 'Investigating diversity', unit_id, 7);

  -- Unit 5: Energy transfers in and between organisms
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('AQA', '3.5', 'Energy transfers in and between organisms', 5) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('AQA', '3.5.1', 'Photosynthesis', unit_id, 1),
    ('AQA', '3.5.2', 'Respiration', unit_id, 2),
    ('AQA', '3.5.3', 'Energy and ecosystems', unit_id, 3),
    ('AQA', '3.5.4', 'Nutrient cycles', unit_id, 4);

  -- Unit 6: Organisms respond to changes in their internal and external environments
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('AQA', '3.6', 'Organisms respond to changes in their internal and external environments', 6) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('AQA', '3.6.1', 'Stimuli, detection and response', unit_id, 1),
    ('AQA', '3.6.2', 'Nervous coordination and muscles', unit_id, 2),
    ('AQA', '3.6.3', 'Homeostasis', unit_id, 3);

  -- Unit 7: Genetics, populations, evolution and ecosystems
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('AQA', '3.7', 'Genetics, populations, evolution and ecosystems', 7) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('AQA', '3.7.1', 'Inheritance', unit_id, 1),
    ('AQA', '3.7.2', 'Populations', unit_id, 2),
    ('AQA', '3.7.3', 'Evolution may lead to speciation', unit_id, 3),
    ('AQA', '3.7.4', 'Populations in ecosystems', unit_id, 4);

  -- Unit 8: The control of gene expression
  insert into syllabus_topics (exam_board, unit_code, topic_name, order_index)
    values ('AQA', '3.8', 'The control of gene expression', 8) returning id into unit_id;
  insert into syllabus_topics (exam_board, unit_code, topic_name, parent_topic_id, order_index) values
    ('AQA', '3.8.1', 'Alteration of the sequence of bases in DNA can alter the structure of proteins', unit_id, 1),
    ('AQA', '3.8.2', 'Genome and transcriptome', unit_id, 2),
    ('AQA', '3.8.3', 'Gene expression and cancer', unit_id, 3),
    ('AQA', '3.8.4', 'Using genome sequencing', unit_id, 4),
    ('AQA', '3.8.5', 'Gene technologies', unit_id, 5);
end $$;
