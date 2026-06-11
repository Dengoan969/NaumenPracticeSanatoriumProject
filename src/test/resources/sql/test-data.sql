-- Disable FK checks for clean inserts
SET REFERENTIAL_INTEGRITY FALSE;

-- ============================================================
-- Roles (DataInitializer is disabled in tests, so we create them here)
-- ============================================================
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT INTO roles (name) VALUES ('ROLE_USER');

-- ============================================================
-- Admin user (id=1)
-- Password: admin123 (bcrypt encoded)
-- ============================================================
INSERT INTO users (email, login, password, full_name, birth_date, phone)
VALUES ('admin@polytechnik.ru', 'admin123', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Администратор Системы', '1990-01-01', '+7-999-111-1111');

-- Admin gets both ROLE_ADMIN (id=1) and ROLE_USER (id=2)
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT INTO user_roles (user_id, role_id) VALUES (1, 2);

-- ============================================================
-- Additional users (ids 2-10)
-- Password for all: password123 (bcrypt encoded)
-- ============================================================
INSERT INTO users (email, login, password, full_name, birth_date, phone) VALUES ('user1@test.com', 'user1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'User One', '1991-02-02', '+7-999-111-1112');
INSERT INTO users (email, login, password, full_name, birth_date, phone) VALUES ('user2@test.com', 'user2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'User Two', '1992-03-03', '+7-999-111-1113');
INSERT INTO users (email, login, password, full_name, birth_date, phone) VALUES ('doctor@test.com', 'doctor1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Doctor One', '1985-04-04', '+7-999-111-1114');
INSERT INTO users (email, login, password, full_name, birth_date, phone) VALUES ('nurse@test.com', 'nurse1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nurse One', '1986-05-05', '+7-999-111-1115');
INSERT INTO users (email, login, password, full_name, birth_date, phone) VALUES ('registrar@test.com', 'registrar1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Registrar One', '1987-06-06', '+7-999-111-1116');
INSERT INTO users (email, login, password, full_name, birth_date, phone) VALUES ('user3@test.com', 'user3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'User Three', '1993-07-07', '+7-999-111-1117');
INSERT INTO users (email, login, password, full_name, birth_date, phone) VALUES ('user4@test.com', 'user4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'User Four', '1994-08-08', '+7-999-111-1118');
INSERT INTO users (email, login, password, full_name, birth_date, phone) VALUES ('user5@test.com', 'user5', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'User Five', '1995-09-09', '+7-999-111-1119');
INSERT INTO users (email, login, password, full_name, birth_date, phone) VALUES ('user6@test.com', 'user6', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'User Six', '1996-10-10', '+7-999-111-1120');

-- All additional users get ROLE_USER (role_id=2)
INSERT INTO user_roles (user_id, role_id) VALUES (2, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (3, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (4, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (5, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (6, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (7, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (8, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (9, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (10, 2);

-- ============================================================
-- Shifts (5 shifts, ids 1-5)
-- ============================================================
INSERT INTO shifts (name, start_date, end_date, is_active, description) VALUES ('Summer 2025 Shift 1', '2025-06-01', '2025-06-21', true, 'First summer shift');
INSERT INTO shifts (name, start_date, end_date, is_active, description) VALUES ('Summer 2025 Shift 2', '2025-06-25', '2025-07-15', true, 'Second summer shift');
INSERT INTO shifts (name, start_date, end_date, is_active, description) VALUES ('Summer 2025 Shift 3', '2025-07-20', '2025-08-09', true, 'Third summer shift');
INSERT INTO shifts (name, start_date, end_date, is_active, description) VALUES ('Autumn 2025 Shift 1', '2025-09-01', '2025-09-21', false, 'First autumn shift');
INSERT INTO shifts (name, start_date, end_date, is_active, description) VALUES ('Autumn 2025 Shift 2', '2025-09-25', '2025-10-15', false, 'Second autumn shift');

-- ============================================================
-- Rooms (5 rooms, ids 1-5)
-- ============================================================
INSERT INTO rooms (number, capacity, description) VALUES ('101', 2, 'Standard room');
INSERT INTO rooms (number, capacity, description) VALUES ('102', 2, 'Standard room');
INSERT INTO rooms (number, capacity, description) VALUES ('201', 3, 'Family room');
INSERT INTO rooms (number, capacity, description) VALUES ('202', 3, 'Family room');
INSERT INTO rooms (number, capacity, description) VALUES ('301', 1, 'VIP room');

-- ============================================================
-- Registrations (8 registrations, ids 1-8)
-- ============================================================
INSERT INTO registrations (user_id, room_id, shift_id, check_in_date, check_out_date) VALUES (2, 1, 1, '2025-06-01', '2025-06-21');
INSERT INTO registrations (user_id, room_id, shift_id, check_in_date, check_out_date) VALUES (3, 2, 1, '2025-06-01', '2025-06-21');
INSERT INTO registrations (user_id, room_id, shift_id, check_in_date, check_out_date) VALUES (7, 3, 2, '2025-06-25', '2025-07-15');
INSERT INTO registrations (user_id, room_id, shift_id, check_in_date, check_out_date) VALUES (8, 4, 2, '2025-06-25', '2025-07-15');
INSERT INTO registrations (user_id, room_id, shift_id, check_in_date, check_out_date) VALUES (9, 1, 3, '2025-07-20', '2025-08-09');
INSERT INTO registrations (user_id, room_id, shift_id, check_in_date, check_out_date) VALUES (10, 2, 3, '2025-07-20', '2025-08-09');
INSERT INTO registrations (user_id, room_id, shift_id, check_in_date, check_out_date) VALUES (2, 5, 4, '2025-09-01', '2025-09-21');
INSERT INTO registrations (user_id, room_id, shift_id, check_in_date, check_out_date) VALUES (3, 1, 5, '2025-09-25', '2025-10-15');

-- ============================================================
-- Cabinets (5 cabinets, ids 1-5)
-- ============================================================
INSERT INTO cabinets (number, name) VALUES ('101', 'Therapy Room');
INSERT INTO cabinets (number, name) VALUES ('102', 'Massage Room');
INSERT INTO cabinets (number, name) VALUES ('201', 'Examination Room');
INSERT INTO cabinets (number, name) VALUES ('202', 'Treatment Room');
INSERT INTO cabinets (number, name) VALUES ('301', 'Physiotherapy Room');

-- ============================================================
-- Procedures (8 procedures, ids 1-8)
-- ============================================================
INSERT INTO procedures (name, cabinet_id, default_duration) VALUES ('General Checkup', 1, 30);
INSERT INTO procedures (name, cabinet_id, default_duration) VALUES ('Blood Test', 1, 15);
INSERT INTO procedures (name, cabinet_id, default_duration) VALUES ('Massage Therapy', 2, 60);
INSERT INTO procedures (name, cabinet_id, default_duration) VALUES ('Back Massage', 2, 45);
INSERT INTO procedures (name, cabinet_id, default_duration) VALUES ('ECG', 3, 20);
INSERT INTO procedures (name, cabinet_id, default_duration) VALUES ('Ultrasound', 3, 30);
INSERT INTO procedures (name, cabinet_id, default_duration) VALUES ('Inhalation', 4, 15);
INSERT INTO procedures (name, cabinet_id, default_duration) VALUES ('Physiotherapy', 5, 40);

-- ============================================================
-- Appointments (10 appointments, ids 1-10)
-- ============================================================
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (1, 2, 4, 1, '2025-06-02', 'Initial checkup');
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (2, 2, 4, 1, '2025-06-02', 'Blood work');
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (3, 3, 4, 1, '2025-06-03', 'Massage therapy session 1');
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (5, 3, 4, 1, '2025-06-03', 'ECG check');
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (1, 7, 4, 2, '2025-06-26', 'Initial checkup');
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (7, 7, 4, 2, '2025-06-27', 'Inhalation therapy');
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (8, 8, 4, 2, '2025-06-26', 'Physiotherapy session');
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (4, 9, 4, 3, '2025-07-21', 'Back massage');
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (6, 10, 4, 3, '2025-07-22', 'Ultrasound');
INSERT INTO appointments (procedure_id, student_id, doctor_id, shift_id, appointment_date, notes) VALUES (3, 10, 4, 3, '2025-07-23', 'Massage therapy');

-- ============================================================
-- Procedure Completions (5 completions, ids 1-5)
-- ============================================================
INSERT INTO procedure_completions (appointment_id, completed_by, completed_at, notes) VALUES (1, 5, '2025-06-02 10:00:00', 'Completed successfully');
INSERT INTO procedure_completions (appointment_id, completed_by, completed_at, notes) VALUES (2, 5, '2025-06-02 10:30:00', 'Blood sample taken');
INSERT INTO procedure_completions (appointment_id, completed_by, completed_at, notes) VALUES (3, 5, '2025-06-03 11:00:00', 'Massage done');
INSERT INTO procedure_completions (appointment_id, completed_by, completed_at, notes) VALUES (5, 5, '2025-06-26 09:00:00', 'Checkup completed');
INSERT INTO procedure_completions (appointment_id, completed_by, completed_at, notes) VALUES (7, 5, '2025-06-27 10:00:00', 'Physiotherapy done');

-- ============================================================
-- Staff-Cabinet assignments (5 assignments)
-- ============================================================
INSERT INTO staff_cabinets (user_id, cabinet_id) VALUES (4, 1);
INSERT INTO staff_cabinets (user_id, cabinet_id) VALUES (4, 3);
INSERT INTO staff_cabinets (user_id, cabinet_id) VALUES (5, 2);
INSERT INTO staff_cabinets (user_id, cabinet_id) VALUES (5, 4);
INSERT INTO staff_cabinets (user_id, cabinet_id) VALUES (4, 5);

-- ============================================================
-- News (5 news articles, ids 1-5)
-- ============================================================
INSERT INTO news (title, content, image_path, created_at) VALUES ('Welcome to Summer Season', 'We are excited to announce the start of the summer season 2025. New procedures and improved facilities await our guests.', '/images/news/summer.jpg', '2025-05-15 09:00:00');
INSERT INTO news (title, content, image_path, created_at) VALUES ('New Physiotherapy Equipment', 'Our sanatorium has acquired state-of-the-art physiotherapy equipment for better treatment outcomes.', '/images/news/physio.jpg', '2025-05-20 10:00:00');
INSERT INTO news (title, content, image_path, created_at) VALUES ('Wellness Workshop Schedule', 'Join our weekly wellness workshops every Saturday. Topics include nutrition, exercise, and mental health.', '/images/news/workshop.jpg', '2025-05-25 11:00:00');
INSERT INTO news (title, content, image_path, created_at) VALUES ('Pool Renovation Complete', 'The indoor pool renovation is complete. Enjoy the newly renovated swimming facilities.', '/images/news/pool.jpg', '2025-06-01 08:00:00');
INSERT INTO news (title, content, image_path, created_at) VALUES ('New Dietary Options', 'Our kitchen now offers specialized dietary options including gluten-free, vegetarian, and diabetic-friendly meals.', '/images/news/diet.jpg', '2025-06-05 12:00:00');

-- ============================================================
-- Feedback messages (3 messages, ids 1-3)
-- ============================================================
INSERT INTO feedback_messages (message, user_id, created_at, is_read) VALUES ('Great facilities and friendly staff!', 2, '2025-06-05 14:00:00', false);
INSERT INTO feedback_messages (message, user_id, created_at, is_read) VALUES ('The massage therapy was excellent.', 3, '2025-06-06 15:00:00', false);
INSERT INTO feedback_messages (message, user_id, created_at, is_read) VALUES ('Would recommend to friends and family.', 7, '2025-06-28 16:00:00', true);

-- Re-enable FK checks
SET REFERENTIAL_INTEGRITY TRUE;
