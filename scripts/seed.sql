PRAGMA foreign_keys = ON;

DELETE FROM appointments;
DELETE FROM groomer_schedules;
DELETE FROM groomer_service_areas;
DELETE FROM grooming_packages;
DELETE FROM groomers;

INSERT OR IGNORE INTO groomers
  (id, name, bio, phone, active, created_at)
VALUES
  ('gro_ava', 'Ava Choi',
   'Specializes in small dogs and anxious pets.', '010-5550-0201', 1, unixepoch() * 1000),
  ('gro_marcus', 'Marcus Lee',
   'Known for patient handling and breed-specific cuts.', '010-5550-0202', 1, unixepoch() * 1000),
  ('gro_jordan', 'Jordan Kim',
   'A cat-friendly groomer with a calm mobile studio.', '010-5550-0203', 1, unixepoch() * 1000);

INSERT OR IGNORE INTO grooming_packages
  (id, name, description, duration_minutes, price_cents)
VALUES
  ('pkg_bath_brush', 'Bath & Brush',
   'A refreshing bath, blow dry, brush-out, and nail trim.', 60, 65000),
  ('pkg_full_groom', 'Full Groom',
   'Bath, brush-out, haircut, nail trim, and ear cleaning.', 90, 95000),
  ('pkg_deluxe', 'Deluxe Spa',
   'Full grooming plus teeth brushing and a soothing paw treatment.', 120, 135000);

INSERT OR IGNORE INTO groomer_service_areas (groomer_id, neighborhood)
VALUES
  ('gro_ava', 'Hannam-dong'),
  ('gro_ava', 'Itaewon'),
  ('gro_ava', 'Yeonnam-dong'),
  ('gro_marcus', 'Yeonnam-dong'),
  ('gro_marcus', 'Seongsu-dong'),
  ('gro_marcus', 'Mangwon-dong'),
  ('gro_jordan', 'Seongsu-dong'),
  ('gro_jordan', 'Gangnam'),
  ('gro_jordan', 'Hannam-dong');

INSERT OR IGNORE INTO groomer_schedules
  (id, groomer_id, weekday, start_time, end_time, available)
VALUES
  ('sch_ava_mon', 'gro_ava', 1, '09:00', '17:00', 1),
  ('sch_ava_tue', 'gro_ava', 2, '09:00', '17:00', 1),
  ('sch_ava_wed', 'gro_ava', 3, '09:00', '17:00', 1),
  ('sch_ava_thu', 'gro_ava', 4, '11:00', '19:00', 1),
  ('sch_ava_fri', 'gro_ava', 5, '09:00', '17:00', 1),
  ('sch_marcus_mon', 'gro_marcus', 1, '10:00', '18:00', 1),
  ('sch_marcus_wed', 'gro_marcus', 3, '10:00', '18:00', 1),
  ('sch_marcus_fri', 'gro_marcus', 5, '10:00', '18:00', 1),
  ('sch_marcus_sat', 'gro_marcus', 6, '09:00', '15:00', 1),
  ('sch_jordan_tue', 'gro_jordan', 2, '10:00', '18:00', 1),
  ('sch_jordan_thu', 'gro_jordan', 4, '10:00', '18:00', 1),
  ('sch_jordan_sat', 'gro_jordan', 6, '09:00', '17:00', 1);

INSERT OR IGNORE INTO appointments
  (id, booking_reference, pet_name, pet_breed, groomer_id, package_id,
   address, neighborhood, starts_at, ends_at, status, price_cents, notes,
   created_at, updated_at)
VALUES
  ('apt_maya_luna', 'CLP-MAYA01', 'Luna', 'Miniature Poodle', 'gro_ava',
   'pkg_full_groom', '34 Hannam-daero, Yongsan-gu', 'Hannam-dong',
   unixepoch('now', '+3 days', '+10 hours') * 1000,
   unixepoch('now', '+3 days', '+11 hours', '+30 minutes') * 1000,
   'confirmed', 95000, 'Please text when you are on the way.',
   unixepoch() * 1000, unixepoch() * 1000),
  ('apt_oliver_biscuit', 'CLP-OLIV01', 'Biscuit', 'Welsh Corgi', 'gro_marcus',
   'pkg_bath_brush', '18 Yanghwa-ro 23-gil, Mapo-gu', 'Yeonnam-dong',
   unixepoch('now', '-5 days', '+9 hours') * 1000,
   unixepoch('now', '-5 days', '+10 hours') * 1000,
   'completed', 65000, NULL,
   unixepoch() * 1000, unixepoch() * 1000);
