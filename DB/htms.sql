
-- Tạo database
CREATE DATABASE IF NOT EXISTS HTMS;
USE HTMS;

-- UserAccount
CREATE TABLE IF NOT EXISTS UserAccount (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         ENUM('USER','STAFF','ACCOUNTANT') NOT NULL,
    full_name    VARCHAR(100) NOT NULL,
    phone        VARCHAR(15),
    email        VARCHAR(100),
    gender       ENUM('Nam','Nữ','Khác'),
    nationality  VARCHAR(50),
    status       ENUM('Active','Inactive') NOT NULL DEFAULT 'Active'
);

-- Room
CREATE TABLE IF NOT EXISTS Room (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    room_name   VARCHAR(100),
    room_number VARCHAR(10) NOT NULL UNIQUE,
    room_type   ENUM('Standard','Deluxe','Suite') NOT NULL,
    base_price  INT  NOT NULL,
    status      ENUM('Vacant','Booked','Inactive') NOT NULL DEFAULT 'Vacant',
    description TEXT
);

-- RoomImage
CREATE TABLE IF NOT EXISTS RoomImage (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    room_id   INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_main   BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_room_image FOREIGN KEY (room_id) REFERENCES Room(id) ON DELETE CASCADE
);

-- HotelService
CREATE TABLE IF NOT EXISTS HotelService (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    price       INT  NOT NULL,
    description TEXT,
    image_url   VARCHAR(255)
);

-- Booking
CREATE TABLE IF NOT EXISTS Booking (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL,
    room_id        INT NOT NULL,
    check_in_date  DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status         ENUM('Cancelled','Confirmed','Completed') NOT NULL DEFAULT 'Confirmed',
    booking_type   ENUM('Day','Night') NOT NULL DEFAULT 'Day',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note           TEXT,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES UserAccount(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_room FOREIGN KEY (room_id)  REFERENCES Room(id)       ON DELETE CASCADE
);

-- Service
CREATE TABLE IF NOT EXISTS Service (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    booking_id        INT NOT NULL,
    hotel_service_id  INT NOT NULL,
    quantity          INT NOT NULL,
    price_override    INT,
    CONSTRAINT fk_service_booking      FOREIGN KEY (booking_id)       REFERENCES Booking(id)       ON DELETE CASCADE,
    CONSTRAINT fk_service_hotelservice FOREIGN KEY (hotel_service_id) REFERENCES HotelService(id)
);

-- PaymentInvoice
CREATE TABLE IF NOT EXISTS PaymentInvoice (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    booking_id     INT NOT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    room_amount    INT NOT NULL,
    service_amount INT NOT NULL,
    tax            INT NOT NULL,
    total_amount   INT NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status         ENUM('Paid','Unpaid') NOT NULL DEFAULT 'Unpaid',
    CONSTRAINT fk_invoice_booking FOREIGN KEY (booking_id) REFERENCES Booking(id) ON DELETE CASCADE
);

-- Feedback
CREATE TABLE IF NOT EXISTS Feedback (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    booking_id INT NOT NULL,
    rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user    FOREIGN KEY (user_id)    REFERENCES UserAccount(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_booking FOREIGN KEY (booking_id) REFERENCES Booking(id)    ON DELETE CASCADE
);

-- UserAccount  passwword:abc123456
INSERT INTO UserAccount (username,password,role,full_name,phone,email,gender,nationality,status) VALUES
('ntminh', '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'STAFF', 'Nguyễn Thị Minh', '0901234501', 'minh.nt@example.com', 'Nữ', 'Vietnam', 'Active'),
('nva',    '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'ACCOUNTANT', 'Nguyễn Văn An', '0901234502', 'an.nv@example.com', 'Nam', 'Vietnam', 'Active'),
('ttb',    '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'USER', 'Trần Thị Bình', '0901234503', 'huutien27012004@gmail.com', 'Nữ', 'Vietnam', 'Active'),
('ptt',    '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'USER', 'Phạm Thị Thảo', '0901234504', 'huutien27012004@gmail.com', 'Nữ', 'Vietnam', 'Active'),
('lhd',    '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'USER', 'Lê Hoàng Dũng', '0901234505', 'huutien27012004@gmail.com', 'Nam', 'Vietnam', 'Active'),
('dth',    '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'USER', 'Đinh Thị Hồng', '0901234506', 'huutien27012004@gmail.com', 'Nữ', 'Vietnam', 'Active'),
('btq',    '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'USER', 'Bùi Tuấn Quang', '0901234507', 'huutien27012004@gmail.com', 'Nam', 'Vietnam', 'Active'),
('cmt',    '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'USER', 'Cao Minh Tuấn', '0901234508', 'huutien27012004@gmail.com', 'Nam', 'Vietnam', 'Active'),
('nttr',   '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'USER', 'Ngô Thị Trang', '0901234509', 'huutien27012004@gmail.com', 'Nữ', 'Vietnam', 'Active'),
('hmt',    '$2a$10$iNXJ3UKC87VxbXdU5gottOcaaPx53GqbYdFrOlft3K2aXRyJzHZaa', 'USER', 'Hoàng Minh Tú', '0901234510', 'huutien27012004@gmail.com', 'Nam', 'Vietnam', 'Active');
-- Room
INSERT INTO Room (room_number, room_name, room_type, base_price, status, description) VALUES
('101', 'Garden Deluxe', 'Standard', 500000, 'Vacant', 'Phòng tiêu chuẩn nhìn ra vườn, không gian xanh mát.'),
('102', 'Cozy Standard', 'Standard', 500000, 'Vacant', 'Phòng tiêu chuẩn thiết kế ấm cúng, đầy đủ tiện nghi.'),
('103', 'City View Deluxe', 'Deluxe', 800000, 'Vacant', 'Phòng deluxe với cửa sổ lớn nhìn ra thành phố.'),
('104', 'Balcony Retreat', 'Deluxe', 800000, 'Vacant', 'Phòng deluxe có ban công riêng, thoáng đãng.'),
('105', 'Ocean Suite', 'Suite', 1500000, 'Vacant', 'Phòng suite cao cấp với view biển tuyệt đẹp.'),
('106', 'Premier Sea Suite', 'Suite', 1500000, 'Vacant', 'Suite sang trọng, hướng biển toàn cảnh.'),
('107', 'Budget Smart', 'Standard', 500000, 'Vacant', 'Phòng tiết kiệm với không gian tiện nghi cơ bản.'),
('108', 'Tranquil Corner', 'Standard', 500000, 'Vacant', 'Phòng ở vị trí yên tĩnh, phù hợp nghỉ ngơi.'),
('109', 'Skyline Deluxe', 'Deluxe', 800000, 'Vacant', 'Phòng deluxe tầng cao, view toàn cảnh thành phố.'),
('110', 'Luxury Bath Suite', 'Suite', 1500000, 'Vacant', 'Suite cao cấp có bồn tắm hiện đại, sang trọng.');

INSERT INTO RoomImage (room_id, image_url, is_main) VALUES
(1, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80', TRUE),
(2, 'https://images.unsplash.com/photo-1613977257363-707ba934822a?w=600&q=80', TRUE),
(3, 'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=600&q=80', TRUE),
(4, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', TRUE),
(5, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80', TRUE),
(6, 'https://images.unsplash.com/photo-1613977257746-d3b5b0d8dbd3?w=600&q=80', TRUE),
(7, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80', TRUE),
(8, 'https://images.unsplash.com/photo-1582719478141-9ff51a6f095d?w=600&q=80', TRUE),
(9, 'https://images.unsplash.com/photo-1578898886411-9b4d818bba59?w=600&q=80', TRUE),
(10, 'https://images.unsplash.com/photo-1622495890063-7763e31fa940?w=600&q=80', TRUE);


-- HotelService (không còn cột unit)
INSERT INTO HotelService (name, price, description, image_url) VALUES
('Bữa sáng',       100000, 'Buffet sáng tại nhà hàng',      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'),
('Giặt ủi',         50000, 'Dịch vụ giặt là chuyên nghiệp', 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'),
('Spa',            300000, 'Thư giãn cơ thể toàn diện',     'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'),
('Xe đưa đón',     200000, 'Đưa đón sân bay 2 chiều',       'https://images.unsplash.com/photo-1583301284852-f72f359cd88b?w=600&q=80'),
('Bữa tối',        150000, 'Set menu buổi tối cao cấp',      'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&q=80'),
('Trà chiều',       90000, 'Trà chiều theo phong cách Anh', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80'),
('Thuê xe đạp',     30000, 'Xe đạp tham quan khuôn viên',   'https://images.unsplash.com/photo-1532274402917-5aadf881bdf8?w=600&q=80');

-- Booking Data
INSERT INTO Booking (id, user_id, room_id, check_in_date, check_out_date, status, booking_type, created_at, note) VALUES
(1, 3, 1, '2025-06-01', '2025-06-03', 'Completed', 'Day', '2025-05-25 10:00:00', 'Không hút thuốc'),
(2, 3, 2, '2025-07-10', '2025-07-12', 'Completed', 'Day', '2025-07-01 11:00:00', 'Gần thang máy'),
(3, 3, 3, '2025-08-05', '2025-08-07', 'Confirmed', 'Day', '2025-07-20 14:00:00', ''),
(4, 4, 4, '2025-06-15', '2025-06-16', 'Completed', 'Night', '2025-06-01 09:30:00', ''),
(5, 4, 5, '2025-07-20', '2025-07-22', 'Cancelled', 'Day', '2025-07-10 15:45:00', 'Khách hủy'),
(6, 4, 6, '2025-08-10', '2025-08-12', 'Confirmed', 'Day', '2025-07-25 13:20:00', ''),
(7, 5, 7, '2025-06-05', '2025-06-12', 'Completed', 'Day', '2025-05-28 16:10:00', ''),
(8, 5, 8, '2025-07-10', '2025-07-12', 'Completed', 'Night', '2025-07-01 10:40:00', 'Tầng thấp'),
(9, 5, 9, '2025-08-15', '2025-08-17', 'Confirmed', 'Day', '2025-08-01 14:50:00', ''),
(10, 6, 10, '2025-06-01', '2025-06-03', 'Completed', 'Night', '2025-05-22 12:00:00', ''),
(11, 6, 1, '2025-07-15', '2025-07-17', 'Completed', 'Night', '2025-07-01 09:10:00', ''),
(12, 6, 2, '2025-08-20', '2025-08-22', 'Confirmed', 'Night', '2025-08-05 11:30:00', ''),
(13, 7, 3, '2025-06-10', '2025-06-12', 'Completed', 'Night', '2025-06-01 13:30:00', ''),
(14, 7, 4, '2025-07-25', '2025-07-27', 'Completed', 'Night', '2025-07-10 10:20:00', ''),
(15, 7, 5, '2025-08-30', '2025-09-01', 'Confirmed', 'Night', '2025-08-15 14:15:00', '');

-- Service
INSERT INTO Service (booking_id, hotel_service_id, quantity, price_override) VALUES
(1, 1, 2, NULL),
(1, 2, 1, NULL),
(4, 3, 1, NULL),
(7, 4, 1, NULL),
(10, 1, 2, NULL),
(13, 5, 2, NULL);

-- PaymentInvoice
INSERT INTO PaymentInvoice (booking_id, room_amount, service_amount, tax, total_amount, payment_method, status) VALUES
(1, 1000000, 200000, 120000, 1320000, 'Tiền mặt', 'Paid'),
(2, 1000000, 0, 100000, 1100000, 'Chuyển khoản', 'Paid'),
(3, 1000000, 0, 100000, 1100000, 'Tiền mặt', 'Unpaid'),
(4, 1600000, 300000, 190000, 2090000, 'Tiền mặt', 'Paid'),
(5, 1600000, 0, 160000, 1760000, 'Tiền mặt', 'Unpaid'),
(6, 1500000, 0, 150000, 1650000, 'Chuyển khoản', 'Unpaid'),
(7, 1000000, 150000, 115000, 1265000, 'Chuyển khoản', 'Paid'),
(8, 1600000, 0, 160000, 1760000, 'Tiền mặt', 'Paid'),
(9, 1600000, 0, 160000, 1760000, 'Tiền mặt', 'Unpaid'),
(10, 1000000, 200000, 120000, 1320000, 'Tiền mặt', 'Paid'),
(11, 1000000, 0, 100000, 1100000, 'Chuyển khoản', 'Paid'),
(12, 1000000, 0, 100000, 1100000, 'Tiền mặt', 'Unpaid'),
(13, 1600000, 300000, 190000, 2090000, 'Tiền mặt', 'Paid'),
(14, 1000000, 150000, 115000, 1265000, 'Chuyển khoản', 'Paid'),
(15, 1600000, 0, 160000, 1760000, 'Tiền mặt', 'Unpaid');

-- Feedback
INSERT INTO Feedback (user_id, booking_id, rating, comment, created_at) VALUES
(3, 1, 5, 'Rất hài lòng với dịch vụ', '2025-06-04 10:00:00'),
(4, 4, 4, 'Ổn nhưng cần cải thiện wifi', '2025-06-17 11:00:00'),
(5, 7, 5, 'Phòng sạch sẽ, yên tĩnh', '2025-06-07 09:30:00'),
(6, 10, 4, 'Nhân viên thân thiện', '2025-06-03 14:00:00'),
(7, 13, 5, 'Trải nghiệm tuyệt vời', '2025-06-12 15:00:00');

select * from Booking;
select * from PaymentInvoice;
select*from Feedback;
SELECT AVG(f.rating) AS average_rating
FROM Feedback f
JOIN Booking b ON f.booking_id = b.id
WHERE b.room_id = 7;
