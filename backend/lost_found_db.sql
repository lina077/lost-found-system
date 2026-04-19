-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 19, 2026 at 05:10 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lost_found_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`) VALUES
(1, 'Electronics', '2026-04-01 17:46:07'),
(2, 'Mobile Phone', '2026-04-01 17:46:07'),
(3, 'Wallet', '2026-04-01 17:46:07'),
(4, 'Watches', '2026-04-01 17:46:07'),
(5, 'Bag', '2026-04-01 17:46:07'),
(6, 'ID Card', '2026-04-01 17:46:07'),
(7, 'Keys', '2026-04-01 17:46:07'),
(8, 'Clothing', '2026-04-01 17:46:07'),
(9, 'Jewelry', '2026-04-01 17:46:07'),
(10, 'Books', '2026-04-01 17:46:07'),
(11, 'Other', '2026-04-01 17:46:07');

-- --------------------------------------------------------

--
-- Table structure for table `claims`
--

CREATE TABLE `claims` (
  `id` int(11) NOT NULL,
  `lost_item_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `proof_of_ownership` varchar(255) DEFAULT NULL,
  `additional_details` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `claims`
--

INSERT INTO `claims` (`id`, `lost_item_id`, `full_name`, `email`, `phone`, `proof_of_ownership`, `additional_details`, `status`, `created_at`, `updated_at`) VALUES
(8, 32, 'Mou found ', 'moumollick75@gmail.com', '', '1d4a15e2654d45d12a10f5ae805e0e20.jpg', 'Same thing which is lost', 'Pending', '2026-04-01 08:24:29', '2026-04-11 08:24:29');

-- --------------------------------------------------------

--
-- Table structure for table `claim_requests`
--

CREATE TABLE `claim_requests` (
  `id` int(11) NOT NULL,
  `lost_item_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `additional_details` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `claim_requests`
--

INSERT INTO `claim_requests` (`id`, `lost_item_id`, `full_name`, `email`, `phone_number`, `image`, `additional_details`, `status`, `created_at`, `updated_at`) VALUES
(11, 2, 'Lina A', 'linafathimahh@gmail.com', '01741633108', '1776000134195.jpeg', 'same thing lost', 'Pending', '2026-04-12 13:22:14', '2026-04-12 13:22:14'),
(14, 4, 'XYZ', 'xyz@gmail.com', '017*****', '1776520219243.webp', 'Same thing lost', 'Pending', '2026-04-18 13:50:19', '2026-04-18 13:50:19');

--
-- Triggers `claim_requests`
--
DELIMITER $$
CREATE TRIGGER `after_claim_request_insert` AFTER INSERT ON `claim_requests` FOR EACH ROW BEGIN
    -- অ্যাডমিনের জন্য নোটিফিকেশন ইনসার্ট করা হচ্ছে
    INSERT INTO `notifications` (`message`, `is_read`, `for_admin`) 
    VALUES (CONCAT('New claim request for Item ID: ', NEW.lost_item_id, ' by ', NEW.full_name), 0, 1);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `found_items`
--

CREATE TABLE `found_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `item_name` varchar(150) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location_found` varchar(200) DEFAULT NULL,
  `date_found` date DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `status` enum('Available','Claimed') DEFAULT 'Available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `item_name` varchar(150) NOT NULL,
  `category_id` varchar(100) NOT NULL DEFAULT 'Other',
  `description` text DEFAULT NULL,
  `location_lost` varchar(200) DEFAULT NULL,
  `date_lost` date DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Found','Resolved') DEFAULT 'Pending',
  `type` varchar(10) DEFAULT 'lost',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `user_id`, `item_name`, `category_id`, `description`, `location_lost`, `date_lost`, `photo`, `status`, `type`, `created_at`, `updated_at`) VALUES
(1, 1, 'Casio fx-991EX Scientific Calculator', 'Electronics', 'Casio fx-991EX scientific calculator, name written on the back with a marker.', 'Central Library (2nd Floor)', '2026-01-01', 'images/calculator.png', 'Pending', 'lost', '2026-04-01 17:46:07', '2026-04-12 13:17:45'),
(2, 1, 'Student ID Card', 'ID Card', 'Metropolitan University Student ID card with blue lanyard. Name: Fathima Akther Lina, ID: 231-115-077, CSE 58th Batch.', 'University Canteen', '2026-02-06', 'images/ID-card.jpeg', 'Pending', 'lost', '2026-04-01 17:46:07', '2026-04-12 13:17:45'),
(3, 1, 'Black Umbrella', 'Other', 'Large black foldable umbrella with a wooden handle and brass ring.', 'Room 202, Academic Building', '2025-05-30', 'images/umbrella.webp', 'Pending', 'lost', '2026-04-01 17:46:07', '2026-04-12 13:17:45'),
(4, 1, 'Spider-Man 3D Keychain', 'Keys', 'Black and red Spider-Man 3D rubber keychain with gold ring and Spider-Man wrist strap.', 'Playground', '2026-02-01', 'images/Spiderman-3D-Keychain-1.webp', 'Pending', 'lost', '2026-04-01 17:46:07', '2026-04-12 13:17:45'),
(5, 1, 'Blue Tupperware Water Bottle', 'Other', 'Blue Tupperware bottle, 1 liter, with flip-top cap.', 'Washroom, Academic Building (2nd Floor)', '2026-01-03', 'images/waterbottle.webp', 'Pending', 'lost', '2026-04-01 17:46:07', '2026-04-12 13:17:45'),
(6, 1, 'Ikigai Book', 'Books', 'Ikigai: The Japanese Secret to a Long and Happy Life. Light blue cover with cherry blossom illustration.', 'Central Library (2nd Floor)', '2026-03-18', 'images/book.jpg', 'Found', 'lost', '2026-04-04 15:06:18', '2026-04-12 11:21:40'),
(7, 1, 'Apple Watch SE (Midnight)', 'Electronics', 'Midnight color Apple Watch SE with black sport band. Screen was showing health data.', 'University Canteen', '2026-03-20', 'images/Apple-Watch.webp', 'Pending', 'lost', '2026-04-04 15:06:18', '2026-04-12 13:17:45'),
(8, 1, 'Brown Leather Wallet', 'Wallet', 'Tan brown genuine leather trifold wallet, Soldi brand embossed on front.', 'Main Gate Area', '2026-03-22', 'images/walletjpg.jpg', 'Pending', 'lost', '2026-04-04 15:06:18', '2026-04-12 13:17:45'),
(9, 1, 'Pink Laptop Bag', 'Bag', 'Pink WiWU brand laptop sleeve bag, 14-15 inch size, with two handles and front zipper pocket.', 'Computer Lab 309', '2026-03-25', 'images/bag.jpg', 'Pending', 'lost', '2026-04-04 15:06:18', '2026-04-12 13:17:45');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `for_admin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `is_read`, `created_at`, `for_admin`) VALUES
(10, NULL, 'New claim request for Item ID: 10 by Mou', 1, '2026-04-12 11:15:55', 1),
(11, 3, 'New claim by Mou on \"Ikigai Book\"', 1, '2026-04-12 11:15:55', 1),
(12, 2, 'Someone claimed your item \"Ikigai Book\". Admin is reviewing.', 1, '2026-04-12 11:15:55', 0),
(13, NULL, 'New claim request for Item ID: 2 by Lina A', 1, '2026-04-12 13:22:14', 1),
(14, 2, 'New claim by Lina A on \"Student ID Card\"', 1, '2026-04-12 13:22:14', 1),
(15, 1, 'Someone claimed your item \"Student ID Card\". Admin is reviewing.', 0, '2026-04-12 13:22:14', 0),
(16, 5, 'New lost item reported: \"Black Umbrella\" at Room 202, Academic Building', 1, '2026-04-18 11:15:49', 1),
(17, NULL, 'New claim request for Item ID: 3 by Lina A', 1, '2026-04-18 11:57:13', 1),
(18, 5, 'New claim by Lina A on \"Black Umbrella\"', 1, '2026-04-18 11:57:13', 1),
(19, 1, 'Someone claimed your item \"Black Umbrella\". Admin is reviewing.', 0, '2026-04-18 11:57:13', 0),
(20, NULL, 'New claim request for Item ID: 11 by ABC', 1, '2026-04-18 13:43:09', 1),
(22, 5, 'Someone claimed your item \"Black Umbrella\". Admin is reviewing.', 0, '2026-04-18 13:43:09', 0),
(23, NULL, 'New claim request for Item ID: 4 by XYZ', 1, '2026-04-18 13:50:19', 1),
(25, 1, 'Someone claimed your item \"Spider-Man 3D Keychain\". Admin is reviewing.', 0, '2026-04-18 13:50:19', 0),
(27, NULL, 'New claim request for Item ID: 11 by PQR', 1, '2026-04-18 14:06:26', 1),
(28, 8, 'New claim by PQR on \"Black Umbrella\"', 1, '2026-04-18 14:06:26', 1),
(29, 5, 'Someone claimed your item \"Black Umbrella\". Admin is reviewing.', 0, '2026-04-18 14:06:26', 0);

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `item_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`item_data`)),
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otps`
--

INSERT INTO `otps` (`id`, `email`, `otp`, `item_data`, `expires_at`, `created_at`) VALUES
(2, 'moumollick75@gmail.com', '969596', '{\"type\":\"lost\",\"title\":\"Blue Tupperware Water Bottle\",\"description\":\"Blue Tupperware Water Bottle plastic\\n\",\"category\":\"Other\",\"location\":\"Washroom, Academic Building (2nd Floor)\",\"date_occurred\":\"2026-01-03\"}', '2026-04-12 08:19:17', '2026-04-12 08:09:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','staff','admin') DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'admin@lostfound.com', '$2b$10$DBrIQpOWlIfbjDrhFVZv7uiu63Op/R6Z3Vk0SIMHVVASLxRnpuEmG', 'admin', '2026-04-01 17:46:07'),
(2, 'Lina', 'fathimalina79@gmail.com', '$2b$10$hTry4HbeKjuAANwWZyS9fez69IBRikrcQ7Fzy.fiKyBVXC.0Ob/dO', 'student', '2026-04-03 13:36:05'),
(3, 'Mou', 'moumollick75@gmail.com', '$2b$10$UDWCzkszsvUh05VVCT4DyuKT.o/.1kv6P3dlyHD.ysUCh7RBHxCUG', 'student', '2026-04-11 15:58:03'),
(4, 'aa', 'aa@gmail.com', '$2b$10$uCDWI06LO9ZTWmGTNC244O.zxL3aDTtiXMUqAB4qP5CziZmCNuqS.', 'student', '2026-04-12 05:54:47'),
(5, 'Fathima', 'linafathimahh@gmail.com', '$2b$10$oEgDu/N9VlAc4WgbKyRCx.efntZ7W3TtA5jFfXeFOUEsRlZ8spzKG', 'student', '2026-04-18 11:12:09'),
(8, 'PQR', 'pqr@gmail.com', '$2b$10$FcfpAEy.Q0ImlBhc0pAMAu9vrBIi6vBPIfPrfO27oQagn/PQUXES2', 'student', '2026-04-18 14:05:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `claim_requests`
--
ALTER TABLE `claim_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lost_item_id` (`lost_item_id`);

--
-- Indexes for table `found_items`
--
ALTER TABLE `found_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `claim_requests`
--
ALTER TABLE `claim_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `found_items`
--
ALTER TABLE `found_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `claim_requests`
--
ALTER TABLE `claim_requests`
  ADD CONSTRAINT `claim_requests_ibfk_1` FOREIGN KEY (`lost_item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `found_items`
--
ALTER TABLE `found_items`
  ADD CONSTRAINT `found_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `found_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
