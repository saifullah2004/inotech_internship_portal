-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 15, 2026 at 06:23 AM
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
-- Database: `inotech_internship_portal`
--

-- --------------------------------------------------------

--
-- Table structure for table `internship_sessions`
--

CREATE TABLE `internship_sessions` (
  `id` int(11) NOT NULL,
  `session_name` varchar(191) NOT NULL,
  `session_code` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `internship_sessions`
--

INSERT INTO `internship_sessions` (`id`, `session_name`, `session_code`, `description`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'summer intership batch 2026', 'S2', '8 weeks intership program', '2026-07-01 00:00:00.000', '2026-09-01 00:00:00.000', 'Completed', '2026-07-14 06:02:20.483', '2026-07-14 09:23:59.484'),
(2, 'fall internship 2026', 'S3', 'new added', '2026-07-02 00:00:00.000', '2026-09-02 00:00:00.000', 'Completed', '2026-07-14 07:06:53.192', '2026-07-14 09:24:05.840'),
(3, 'summer intership batch-02 2026', 'S3', 'Btach-02', '2026-07-01 00:00:00.000', '2026-09-01 00:00:00.000', 'Completed', '2026-07-14 07:16:08.848', '2026-07-14 10:25:11.232'),
(4, 'summer intership batch-03 2026', 'S3', 'anything', '2026-07-02 00:00:00.000', '2026-10-01 00:00:00.000', 'Active', '2026-07-14 11:12:21.587', '2026-07-14 11:12:21.587');

-- --------------------------------------------------------

--
-- Table structure for table `intern_details`
--

CREATE TABLE `intern_details` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(191) NOT NULL,
  `father_name` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `address` text NOT NULL,
  `university` varchar(191) NOT NULL,
  `department` varchar(191) NOT NULL,
  `semester` varchar(191) NOT NULL,
  `cgpa` double NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `picture_path` varchar(191) NOT NULL,
  `cv_path` varchar(191) NOT NULL,
  `cnic_path` varchar(191) NOT NULL,
  `recommendation_letter_path` varchar(191) DEFAULT NULL,
  `police_verification_path` varchar(191) DEFAULT NULL,
  `terms_accepted` tinyint(1) NOT NULL,
  `submitted_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `intern_details`
--

INSERT INTO `intern_details` (`id`, `user_id`, `full_name`, `father_name`, `phone`, `address`, `university`, `department`, `semester`, `cgpa`, `start_date`, `picture_path`, `cv_path`, `cnic_path`, `recommendation_letter_path`, `police_verification_path`, `terms_accepted`, `submitted_at`) VALUES
(1, 2, 'Test Candidate', 'Candidate Father', '03001234567', 'House 123, Sector G-11, Islamabad', 'NUST', 'Computer Science', '8th', 3.56, '2026-08-01 00:00:00.000', '/uploads/2/picture.png', '/uploads/2/cv.pdf', '/uploads/2/cnic.pdf', '/uploads/2/recommendationLetter.jpeg', '/uploads/2/policeVerification.png', 1, '2026-07-11 06:53:37.314'),
(2, 3, 'haseeb', 'haseeb father', '0312554797', 'VPO Malikwal Teshsil Talagang District Chakwal', 'NUST', 'Computer Science', '4th', 2.78, '2026-07-01 00:00:00.000', '/uploads/3/picture.jpg', '/uploads/3/cv.pdf', '/uploads/3/cnic.jpg', '/uploads/3/recommendationLetter.jpg', '/uploads/3/policeVerification.jpg', 1, '2026-07-11 09:49:04.319'),
(3, 4, 'saif', 'Malik Imtiaz Ahmed', '03135547972', 'vpo malikwal talagang', 'UOC', 'computer science', '8th', 3.53, '2026-08-01 00:00:00.000', '/uploads/4/picture.jpeg', '/uploads/4/cv.pdf', '/uploads/4/cnic.jpg', '/uploads/4/recommendationLetter.pdf', NULL, 1, '2026-07-11 10:07:32.287'),
(4, 7, 'user2', 'father', '03125547972', 'VPO Malikwal Teshsil Talagang District Chakwal', 'UOC', 'Computer Science', '8th', 3.55, '2026-07-04 00:00:00.000', '/uploads/7/picture.png', '/uploads/7/cv.pdf', '/uploads/7/cnic.pdf', '/uploads/7/recommendationLetter.pdf', '/uploads/7/policeVerification.pdf', 1, '2026-07-13 07:44:42.317'),
(5, 8, 'user3', 'father', '03135547972', 'vpo malikwal talagang', 'UOC', 'computer science', '8th', 3.53, '2026-08-01 00:00:00.000', '/uploads/8/picture.jpg', '/uploads/8/cv.pdf', '/uploads/8/cnic.jpg', '/uploads/8/recommendationLetter.pdf', '/uploads/8/policeVerification.pdf', 1, '2026-07-13 09:17:43.099'),
(6, 9, 'user4', 'father', '0313-5547972', 'VPO Malikwal Teshsil Talagang District Chakwal', 'UOC', 'Computer Science', '4th', 3.63, '2026-04-23 00:00:00.000', '/uploads/9/picture.jpg', '/uploads/9/cv.pdf', '/uploads/9/cnic.pdf', '/uploads/9/recommendationLetter.pdf', '/uploads/9/policeVerification.pdf', 1, '2026-07-13 09:52:06.884'),
(7, 12, 'user8', 'father', '03135547972', 'vpo malikwal talagang', 'UOC', 'computer science', '8th', 3.53, '2026-08-01 00:00:00.000', '/uploads/12/picture.png', '/uploads/12/cv.pdf', '/uploads/12/cnic.pdf', '/uploads/12/recommendationLetter.pdf', NULL, 1, '2026-07-14 06:59:12.342');

-- --------------------------------------------------------

--
-- Table structure for table `intern_requests`
--

CREATE TABLE `intern_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` varchar(191) NOT NULL,
  `requested_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `decided_at` datetime(3) DEFAULT NULL,
  `decided_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `intern_requests`
--

INSERT INTO `intern_requests` (`id`, `user_id`, `status`, `requested_at`, `decided_at`, `decided_by`) VALUES
(1, 2, 'approved', '2026-07-10 18:48:58.761', '2026-07-10 18:50:52.751', 1),
(2, 4, 'approved', '2026-07-11 09:58:56.343', NULL, NULL),
(3, 5, 'approved', '2026-07-11 09:59:51.635', '2026-07-13 06:09:42.076', 1),
(4, 6, 'declined', '2026-07-13 06:12:56.486', '2026-07-13 06:13:24.615', 1),
(5, 7, 'approved', '2026-07-13 06:20:31.596', '2026-07-13 06:20:57.721', 1),
(6, 9, 'approved', '2026-07-13 09:23:43.379', '2026-07-13 09:35:57.540', 1),
(7, 10, 'approved', '2026-07-14 04:52:24.161', '2026-07-14 04:53:05.882', 1),
(8, 11, 'approved', '2026-07-14 06:03:53.142', '2026-07-14 06:04:10.788', 1),
(9, 13, 'approved', '2026-07-14 07:07:42.640', '2026-07-14 07:07:59.188', 1),
(10, 14, 'approved', '2026-07-14 08:10:46.758', '2026-07-14 11:14:49.130', 1),
(11, 15, 'approved', '2026-07-14 10:21:38.332', '2026-07-14 10:21:58.291', 1),
(12, 16, 'approved', '2026-07-14 11:17:51.795', '2026-07-14 11:18:22.169', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'user',
  `application_status` varchar(191) NOT NULL DEFAULT 'not_submitted',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `reset_otp` varchar(191) DEFAULT NULL,
  `reset_otp_expires` datetime(3) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `application_status`, `created_at`, `reset_otp`, `reset_otp_expires`, `session_id`) VALUES
(1, 'Inotech Admin', 'admin@inotech.com', '$2b$10$4LhkDTZ1YTmcPKAKnrDg6OltL7geu4xay4VSEdewOVoiydojSohP.', 'admin', 'approved', '2026-07-10 18:35:23.012', NULL, NULL, NULL),
(2, 'Test Candidate', 'candidate@example.com', '$2b$10$RSYhcS/txVE5Pv8xrGoLvuuEjP/9RAWBoGCX/jQACIgRh7zqw5Iey', 'user', 'submitted', '2026-07-10 18:48:56.975', NULL, NULL, NULL),
(3, 'haseeb', 'haseeb@gmail.com', '$2b$10$gKesunNbDFcsPT/6Wm3RRu9BLyPzX1fdvSBGK6moztwNwjVd/HzdK', 'user', 'submitted', '2026-07-11 09:49:04.283', NULL, NULL, NULL),
(4, 'saif', 'msaifullahawan2004@gmail.com', '$2b$10$8RQcYx3jbyLQkhrF4.M45Oi2lh.7VpRFtnpeuL16Wnea5EyQTN1qK', 'user', 'submitted', '2026-07-11 09:58:56.079', NULL, NULL, NULL),
(5, 'saifullah', 'saif@gmail.com', '$2b$10$ZJmyNrr2p9PT4/oHIbJ3besztJ4W0t/pxE6HcpOPmX0l4M9f3CGEi', 'user', 'approved', '2026-07-11 09:59:51.436', NULL, NULL, NULL),
(6, 'user1', 'user1@gmail.com', '$2b$10$cr/hyjogshAKQaZkx0g.M.eyces5RqT2Ckw4bpriIiY7dd6oRXPAm', 'user', 'declined', '2026-07-13 06:12:56.225', NULL, NULL, NULL),
(7, 'user2', 'user2@gmail.com', '$2b$10$a7of0b9ny0WJInGuMIXJheR9BdH3paHZv0RLLbtIenDnBQnVXAxG.', 'user', 'submitted', '2026-07-13 06:20:31.352', NULL, NULL, NULL),
(8, 'user3', 'user3@gmail.com', '$2b$10$E27KB5vgSmtqL.Q4Th70XeXkj3j61GoEPlSdj9FS/TcDAHE3wMyAm', 'user', 'submitted', '2026-07-13 09:17:42.990', NULL, NULL, NULL),
(9, 'user4', 'user4@gmail.com', '$2b$10$fqU8NtS6eZqeed1cG8Vs5OVdObWoNb9/hJvmczlyVVvCuO1OWFaNS', 'user', 'submitted', '2026-07-13 09:23:42.814', NULL, NULL, NULL),
(10, 'user5', 'user5@gmail.com', '$2b$10$3ulcgPlQAUE.euBj4EmnwuFKWT8cRHk5JQascD5vcX9.nbanNIQAa', 'user', 'approved', '2026-07-14 04:52:23.642', NULL, NULL, NULL),
(11, 'user6', 'user6@gmail.com', '$2b$10$hLpkcT0B24lsxtlrKn5YKuSO/HbQnCN/bRk5qNFZVGdjPBv.1WYSC', 'user', 'approved', '2026-07-14 06:03:52.525', NULL, NULL, 1),
(12, 'user8', 'user8@gmail.com', '$2b$10$UG.fZxGIMeImuzN0Dh8Uh.tC7KZP86mcE/RsMXCQg6vLp8uhEhZpS', 'user', 'submitted', '2026-07-14 06:59:12.271', NULL, NULL, 1),
(13, 'user11', 'user11@gmail.com', '$2b$10$tZGxDvi5mtzXlap5dqjWseFHA1IpSPE.bJ1ZJ48.CWYncBShBHaFa', 'user', 'approved', '2026-07-14 07:07:42.259', NULL, NULL, 2),
(14, 'user12', 'user12@gmail.com', '$2b$10$Lj6JzHLqnsnktUYyOH0CaeDKPNiM6MRcaIc9Vfl7wueOvRgRMmM5q', 'user', 'approved', '2026-07-14 08:10:46.432', NULL, NULL, 3),
(15, 'user111', 'user111@gmail.com', '$2b$10$xTkFhc0Vm7B0H2kYnQB/..T3MDdydGdN1goi3Ddf2cvoQ2MV6Wzn.', 'user', 'approved', '2026-07-14 10:21:37.666', NULL, NULL, 3),
(16, 'user123', 'user123@gmail.com', '$2b$10$LZDzVvyAXZcLHAlCn005n.fAEbNuzhkpPjILHTs1yIn.N9GljevjG', 'user', 'approved', '2026-07-14 11:17:51.392', NULL, NULL, 4);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('607a667a-4872-42ca-b3aa-eb70433a4fa3', '113db6e1b4875e0085ebb2c1a7ac1084518771874bf82130a60a7239f30b996a', '2026-07-10 18:34:49.554', '20260710183449_init', NULL, NULL, '2026-07-10 18:34:49.327', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `internship_sessions`
--
ALTER TABLE `internship_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `intern_details`
--
ALTER TABLE `intern_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `intern_details_user_id_key` (`user_id`);

--
-- Indexes for table `intern_requests`
--
ALTER TABLE `intern_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `intern_requests_status_idx` (`status`),
  ADD KEY `intern_requests_user_id_fkey` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_email_idx` (`email`),
  ADD KEY `users_session_id_fkey` (`session_id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `internship_sessions`
--
ALTER TABLE `internship_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `intern_details`
--
ALTER TABLE `intern_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `intern_requests`
--
ALTER TABLE `intern_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `intern_details`
--
ALTER TABLE `intern_details`
  ADD CONSTRAINT `intern_details_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `intern_requests`
--
ALTER TABLE `intern_requests`
  ADD CONSTRAINT `intern_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `internship_sessions` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
