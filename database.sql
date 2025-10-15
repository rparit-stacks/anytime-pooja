-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: pandit_ecom
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `user_id` int DEFAULT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cart_session` (`session_id`),
  KEY `idx_cart_user` (`user_id`),
  KEY `idx_cart_product` (`product_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_sessions`
--

DROP TABLE IF EXISTS `cart_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `cart_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_sessions`
--

LOCK TABLES `cart_sessions` WRITE;
/*!40000 ALTER TABLE `cart_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Crystals & Gemstones','crystals','Healing crystals and precious gemstones for spiritual wellness','/upload/categories/1760333364246-pngtree-astrology-chart-light-effect-png-image_3840493.png',1,1,'2025-10-13 04:29:15','2025-10-13 05:36:51'),(2,'Tarot Cards','tarot','Authentic tarot card decks for divination and guidance','/upload/categories/1760333350359-pngtree-astrology-chart-light-effect-png-image_3840493.png',1,2,'2025-10-13 04:29:15','2025-10-13 05:36:58'),(3,'Pooja Items','pooja','Traditional Hindu worship items and ritual essentials','/upload/categories/1760333848498-main-banner-1-removebg-preview (1).png',1,3,'2025-10-13 04:29:15','2025-10-13 05:37:32'),(4,'Incense & Fragrances','incense','Sacred incense, essential oils, and aromatic products','/luxury-scented-candle.jpg',1,4,'2025-10-13 04:29:15','2025-10-13 05:24:42'),(5,'Astrology Books','books','Books on astrology, spirituality, and ancient wisdom','/modern-electronics.png',1,5,'2025-10-13 04:29:15','2025-10-13 05:24:42'),(6,'Meditation Tools','meditation','Mala beads, meditation cushions, and mindfulness tools','/premium-wireless-headphones.png',1,6,'2025-10-13 04:29:15','2025-10-13 05:24:42'),(7,'Rudraksha & Malas','rudraksha','Sacred Rudraksha beads and prayer malas','/premium-accessories-watches.jpg',1,7,'2025-10-13 04:29:15','2025-10-13 05:24:42'),(8,'Yantras & Symbols','yantras','Sacred geometric symbols and spiritual yantras','/elegant-ceramic-coffee-mugs.jpg',1,8,'2025-10-13 04:29:15','2025-10-13 05:24:42'),(9,'Vastu Items','vastu','Vastu Shastra products for home and office harmony','/modern-minimalist-desk-lamp.jpg',1,9,'2025-10-13 04:29:15','2025-10-13 05:24:42'),(10,'Feng Shui','fengshui','Feng Shui products for positive energy flow','/upload/categories/1760333375147-pngtree-astrology-chart-light-effect-png-image_3840493.png',1,10,'2025-10-13 04:29:15','2025-10-13 05:37:03');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification_tokens`
--

DROP TABLE IF EXISTS `email_verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `email_verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_tokens`
--

LOCK TABLES `email_verification_tokens` WRITE;
/*!40000 ALTER TABLE `email_verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `footer_settings`
--

DROP TABLE IF EXISTS `footer_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `footer_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `section_key` varchar(100) NOT NULL,
  `section_value` text,
  `section_type` enum('text','json','file') DEFAULT 'text',
  `section_name` varchar(100) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `section_key` (`section_key`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `footer_settings`
--

LOCK TABLES `footer_settings` WRITE;
/*!40000 ALTER TABLE `footer_settings` DISABLE KEYS */;
INSERT INTO `footer_settings` VALUES (1,'footer_about_title','About Anytime Pooja','text','about','Footer about section title',1,1,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(2,'footer_about_text','Your trusted destination for authentic spiritual products, pooja essentials, and sacred collections. We are committed to providing high-quality items for your spiritual journey.','text','about','Footer about section text',1,2,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(3,'footer_quick_links_title','Quick Links','text','quick_links','Footer quick links section title',1,3,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(4,'footer_quick_links','[{\"title\":\"Home\",\"url\":\"/\"},{\"title\":\"About Us\",\"url\":\"/about\"},{\"title\":\"Products\",\"url\":\"/products\"},{\"title\":\"Contact\",\"url\":\"/contact\"}]','json','quick_links','Footer quick links JSON array',1,4,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(5,'footer_categories_title','Categories','text','categories','Footer categories section title',1,5,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(6,'footer_categories','[{\"title\":\"Pooja Items\",\"url\":\"/products?category=pooja-items\"},{\"title\":\"Rudraksha\",\"url\":\"/products?category=rudraksha\"},{\"title\":\"Crystals\",\"url\":\"/products?category=crystals\"},{\"title\":\"Mandir Items\",\"url\":\"/products?category=mandir\"}]','json','categories','Footer categories JSON array',1,6,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(7,'footer_contact_title','Contact Info','text','contact','Footer contact section title',1,7,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(8,'footer_contact_address','123 Spiritual Street, Divine City, India - 110001','text','contact','Footer contact address',1,8,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(9,'footer_contact_phone','+91-9876543211','text','contact','Footer contact phone',1,9,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(10,'footer_contact_email','support@anytimepooja.com','text','contact','Footer contact email',1,10,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(11,'footer_social_title','Follow Us','text','social','Footer social media section title',1,11,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(12,'footer_social_links','[{\"platform\":\"Facebook\",\"url\":\"https://facebook.com/anytimepooja\",\"icon\":\"fa-facebook\"},{\"platform\":\"Instagram\",\"url\":\"https://instagram.com/anytimepooja\",\"icon\":\"fa-instagram\"},{\"platform\":\"Twitter\",\"url\":\"https://twitter.com/anytimepooja\",\"icon\":\"fa-twitter\"},{\"platform\":\"YouTube\",\"url\":\"https://youtube.com/anytimepooja\",\"icon\":\"fa-youtube\"}]','json','social','Footer social media links JSON array',1,12,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(13,'footer_newsletter_title','Subscribe to Newsletter','text','newsletter','Footer newsletter section title',1,13,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(14,'footer_newsletter_text','Get updates on new products and spiritual insights.','text','newsletter','Footer newsletter description',1,14,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(15,'footer_newsletter_placeholder','Enter your email address','text','newsletter','Footer newsletter input placeholder',1,15,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(16,'footer_payment_methods','[{\"name\":\"Visa\",\"icon\":\"fa-cc-visa\"},{\"name\":\"Mastercard\",\"icon\":\"fa-cc-mastercard\"},{\"name\":\"PayPal\",\"icon\":\"fa-paypal\"},{\"name\":\"UPI\",\"icon\":\"fa-mobile-alt\"}]','json','payment','Footer payment methods JSON array',1,16,'2025-10-13 06:33:16','2025-10-13 06:44:56'),(17,'footer_copyright','© 2024 Anytime Pooja. All rights reserved.','text','copyright','Footer copyright text',1,17,'2025-10-13 06:33:16','2025-10-13 06:44:56');
/*!40000 ALTER TABLE `footer_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'Premium Rose Quartz Crystal',299.99,1,299.99,'2025-10-15 07:15:25'),(2,2,2,'Sacred Ganesha Idol',549.99,1,549.99,'2025-10-15 07:19:15');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `user_id` int DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `billing_first_name` varchar(100) NOT NULL,
  `billing_last_name` varchar(100) NOT NULL,
  `billing_company` varchar(100) DEFAULT NULL,
  `billing_address_line_1` varchar(255) NOT NULL,
  `billing_address_line_2` varchar(255) DEFAULT NULL,
  `billing_city` varchar(100) NOT NULL,
  `billing_state` varchar(100) NOT NULL,
  `billing_postal_code` varchar(20) NOT NULL,
  `billing_country` varchar(100) NOT NULL DEFAULT 'India',
  `billing_phone` varchar(20) DEFAULT NULL,
  `shipping_first_name` varchar(100) NOT NULL,
  `shipping_last_name` varchar(100) NOT NULL,
  `shipping_company` varchar(100) DEFAULT NULL,
  `shipping_address_line_1` varchar(255) NOT NULL,
  `shipping_address_line_2` varchar(255) DEFAULT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_state` varchar(100) NOT NULL,
  `shipping_postal_code` varchar(20) NOT NULL,
  `shipping_country` varchar(100) NOT NULL DEFAULT 'India',
  `shipping_phone` varchar(20) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `shipping_cost` decimal(10,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipping_method` varchar(100) DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-1760512525653-9GPPDNHQ2',4,'+919810167696','+919810167696','ROHIT','PARIT','','229/43 RAILWAY COLONY MANDAWALI GALI NUMBER 11 5TH FLOOR DELHI 110092','','NEW DELHI','Delhi','110092','India','+919810167696','ROHIT','PARIT','','229/43 RAILWAY COLONY MANDAWALI GALI NUMBER 11 5TH FLOOR DELHI 110092','','NEW DELHI','Delhi','110092','India','09810167696',299.99,50.00,54.00,0.00,403.99,'confirmed','paid','razorpay','pay_RTf9Cez4B5SWlf',NULL,NULL,NULL,NULL,'2025-10-15 07:15:25','2025-10-15 07:15:25'),(2,'ORD-1760512755370-V2Y9SXXOW',4,'+919810167696','+919810167696','ROHIT','PARIT','','229/43 RAILWAY COLONY MANDAWALI GALI NUMBER 11 5TH FLOOR DELHI 110092','','NEW DELHI','Delhi','110092','India','+919810167696','ROHIT','PARIT','','229/43 RAILWAY COLONY MANDAWALI GALI NUMBER 11 5TH FLOOR DELHI 110092','','NEW DELHI','Delhi','110092','India','09810167696',549.99,50.00,99.00,0.00,698.99,'confirmed','paid','razorpay','pay_RTfDDCEwF1eOHX',NULL,NULL,NULL,NULL,'2025-10-15 07:19:15','2025-10-15 07:19:15');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verification`
--

DROP TABLE IF EXISTS `otp_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `purpose` enum('registration','login','password_reset','test') DEFAULT 'registration',
  `is_verified` tinyint(1) DEFAULT '0',
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_otp_code` (`otp_code`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_email_purpose` (`email`,`purpose`),
  KEY `idx_email_purpose_verified` (`email`,`purpose`,`is_verified`),
  CONSTRAINT `otp_verification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `otp_verification_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verification`
--

LOCK TABLES `otp_verification` WRITE;
/*!40000 ALTER TABLE `otp_verification` DISABLE KEYS */;
INSERT INTO `otp_verification` VALUES (4,NULL,'test@example.com','424240','registration',0,'2025-10-13 08:04:14','2025-10-13 07:59:13','2025-10-13 07:59:13'),(9,NULL,'rbusiness1999@gmail.com','361703','test',1,'2025-10-13 08:23:14','2025-10-13 08:18:14','2025-10-13 08:21:46'),(12,NULL,'testuser@example.com','661379','registration',1,'2025-10-13 08:27:08','2025-10-13 08:22:07','2025-10-13 08:22:24'),(13,NULL,'rohitparit1934@gmail.com','217414','registration',1,'2025-10-13 08:28:32','2025-10-13 08:23:31','2025-10-13 08:25:57'),(14,3,'newuser@example.com','381248','registration',1,'2025-10-13 08:32:55','2025-10-13 08:27:54','2025-10-13 08:53:30'),(19,NULL,'rohitparit1934@gmail.com','843829','login',1,'2025-10-13 08:45:00','2025-10-13 08:40:00','2025-10-13 08:40:18'),(20,NULL,'rbusiness1999@gmail.com','801466','registration',1,'2025-10-13 09:00:32','2025-10-13 08:55:31','2025-10-13 08:55:54'),(23,NULL,'rbusiness1999@gmail.com','654368','login',1,'2025-10-15 07:18:35','2025-10-15 07:13:35','2025-10-15 07:14:00');
/*!40000 ALTER TABLE `otp_verification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `short_description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `gallery` json DEFAULT NULL,
  `category_id` int NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `rating` decimal(3,2) DEFAULT '0.00',
  `review_count` int DEFAULT '0',
  `badge` varchar(50) DEFAULT NULL,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `origin` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_active` (`is_active`),
  KEY `idx_products_featured` (`is_featured`),
  KEY `idx_products_price` (`price`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Premium Rose Quartz Crystal','premium-rose-quartz-crystal','Beautiful natural rose quartz crystal for love and healing. Perfect for meditation and energy work.','Natural rose quartz crystal for love and healing',299.99,399.99,'/premium-wireless-headphones.png',NULL,1,50,1,1,4.80,234,'Trending',NULL,NULL,'Natural Crystal','Brazil','2025-10-13 04:29:15','2025-10-13 04:29:15'),(2,'Sacred Ganesha Idol','sacred-ganesha-idol','Handcrafted brass Ganesha idol for home temple. Brings prosperity and removes obstacles.','Handcrafted brass Ganesha idol for prosperity',549.99,NULL,'/luxury-leather-handbag.jpg',NULL,3,25,1,1,4.90,189,NULL,NULL,NULL,'Brass','India','2025-10-13 04:29:15','2025-10-13 04:29:15'),(3,'Rider-Waite Tarot Deck','rider-waite-tarot-deck','Classic Rider-Waite tarot deck for divination and spiritual guidance. Perfect for beginners and experts.','Classic tarot deck for divination and guidance',399.99,499.99,'/modern-smart-watch.jpg',NULL,2,100,1,1,4.70,456,'Best Seller',NULL,NULL,'Cardboard','USA','2025-10-13 04:29:15','2025-10-13 04:29:15'),(4,'Sandalwood Incense Sticks','sandalwood-incense-sticks','Premium sandalwood incense sticks for meditation and pooja. 100% natural and aromatic.','Premium sandalwood incense for meditation',89.99,NULL,'/modern-minimalist-desk-lamp.jpg',NULL,4,200,1,0,4.60,123,NULL,NULL,NULL,'Natural Sandalwood','India','2025-10-13 04:29:15','2025-10-13 04:29:15'),(5,'Rudraksha Mala 108 Beads','rudraksha-mala-108-beads','Authentic 5-mukhi Rudraksha mala with 108 beads. Perfect for meditation and spiritual practice.','Authentic Rudraksha mala for meditation',49.99,69.99,'/premium-cotton-tshirt.jpg',NULL,7,75,1,0,4.50,567,NULL,NULL,NULL,'Rudraksha','Nepal','2025-10-13 04:29:15','2025-10-13 04:29:15'),(6,'Crystal Singing Bowl Set','crystal-singing-bowl-set','Tibetan crystal singing bowl set for sound healing and meditation. Includes mallet and cushion.','Crystal singing bowl set for sound healing',39.99,NULL,'/elegant-ceramic-coffee-mugs.jpg',NULL,6,30,1,0,4.80,234,NULL,NULL,NULL,'Crystal','Tibet','2025-10-13 04:29:15','2025-10-13 04:29:15'),(7,'Vastu Yantra for Home','vastu-yantra-for-home','Sacred Vastu yantra for home harmony and positive energy. Made of pure copper.','Sacred Vastu yantra for home harmony',59.99,NULL,'/sleek-wireless-charger.jpg',NULL,9,40,1,0,4.70,345,NULL,NULL,NULL,'Copper','India','2025-10-13 04:29:15','2025-10-13 04:29:15'),(8,'Lavender Essential Oil','lavender-essential-oil','Pure lavender essential oil for aromatherapy and relaxation. 10ml bottle.','Pure lavender essential oil for aromatherapy',34.99,NULL,'/luxury-scented-candle.jpg',NULL,4,150,1,0,4.90,178,NULL,NULL,NULL,'Essential Oil','France','2025-10-13 04:29:15','2025-10-13 04:29:15'),(9,'Tibetan Prayer Flags','tibetan-prayer-flags','Traditional Tibetan prayer flags for blessings and positive energy. Set of 5 flags.','Traditional Tibetan prayer flags for blessings',79.99,NULL,'/leather-wallet.jpg',NULL,8,60,1,0,4.60,289,NULL,NULL,NULL,'Cotton','Tibet','2025-10-13 04:29:15','2025-10-13 04:29:15'),(10,'Amethyst Geode Cluster','amethyst-geode-cluster','Natural amethyst geode cluster for spiritual protection and meditation. Beautiful purple crystals.','Natural amethyst geode for spiritual protection',149.99,199.99,'/bluetooth-speaker.jpg',NULL,1,20,1,1,4.80,412,'Trending',NULL,NULL,'Natural Crystal','Brazil','2025-10-13 04:29:15','2025-10-13 04:29:15');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo_banners`
--

DROP TABLE IF EXISTS `promo_banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo_banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `banner_key` varchar(100) NOT NULL,
  `banner_title` varchar(255) DEFAULT NULL,
  `banner_description` text,
  `banner_image` varchar(500) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_url` varchar(500) DEFAULT NULL,
  `banner_order` int DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `banner_key` (`banner_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo_banners`
--

LOCK TABLES `promo_banners` WRITE;
/*!40000 ALTER TABLE `promo_banners` DISABLE KEYS */;
INSERT INTO `promo_banners` VALUES (1,'banner_1','New Fashion Collection','Elevate your style with our latest arrivals','/upload/banners/1760338327705-horoscope.jpg','Shop Fashion','/products?category=fashion',1,1,'2025-10-13 06:49:28','2025-10-13 06:52:07'),(2,'banner_2','Tech Essentials','Discover cutting-edge electronics','/upload/banners/1760338341387-Lakshmi_Yantra_Pyramid_Raw_Pyrite_Stone_FREE_medium.jpeg','Explore Tech','/products?category=electronics',2,1,'2025-10-13 06:49:28','2025-10-13 06:52:21');
/*!40000 ALTER TABLE `promo_banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comment` text,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` enum('text','number','boolean','json','file') DEFAULT 'text',
  `category` enum('seo','logo','smtp','favicon','general') DEFAULT 'general',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'site_title','Anytime Pooja - Your Spiritual Journey','text','seo','Main site title for SEO',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(2,'site_description','Discover authentic spiritual items, pooja essentials, and sacred collections for your spiritual journey.','text','seo','Main site description for SEO',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(3,'site_keywords','pooja items, spiritual products, rudraksha, crystals, mandir, astrology, sacred items','text','seo','Main site keywords for SEO',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(4,'og_title','Anytime Pooja - Spiritual Products & Pooja Items','text','seo','Open Graph title for social sharing',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(5,'og_description','Shop authentic spiritual products, pooja essentials, and sacred collections online.','text','seo','Open Graph description for social sharing',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(6,'og_image','/images/og-image.jpg','file','seo','Open Graph image for social sharing',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(7,'twitter_card','summary_large_image','text','seo','Twitter card type',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(8,'twitter_site','@anytimepooja','text','seo','Twitter handle',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(9,'canonical_url','https://anytimepooja.in','text','seo','Canonical URL for SEO',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(10,'robots_txt','User-agent: *\nAllow: /\nSitemap: https://anytimepooja.com/sitemap.xml','text','seo','Robots.txt content',1,'2025-10-13 06:22:42','2025-10-13 06:31:30'),(11,'logo_url','/images/logo-1760337011820.png','file','logo','Main logo URL',1,'2025-10-13 06:22:42','2025-10-13 06:30:11'),(12,'logo_width','150','number','logo','Logo width in pixels',1,'2025-10-13 06:22:42','2025-10-13 06:30:11'),(13,'logo_height','60','number','logo','Logo height in pixels',1,'2025-10-13 06:22:42','2025-10-13 06:30:11'),(14,'favicon_url','/favicon-1760338982928.png','file','favicon','Favicon URL',1,'2025-10-13 06:22:42','2025-10-13 07:03:02'),(15,'apple_touch_icon','/images/apple-touch-icon-1760337067419.png','file','favicon','Apple touch icon URL',1,'2025-10-13 06:22:42','2025-10-13 07:03:02'),(16,'smtp_host','smtp.hostinger.com','text','smtp','SMTP server host',1,'2025-10-13 06:22:42','2025-10-13 07:38:40'),(17,'smtp_port','465','number','smtp','SMTP server port',1,'2025-10-13 06:22:42','2025-10-13 07:38:40'),(18,'smtp_secure','true','boolean','smtp','Use secure connection (TLS)',1,'2025-10-13 06:22:42','2025-10-13 07:38:40'),(19,'smtp_username','help@anytimepooja.in','text','smtp','SMTP username/email',1,'2025-10-13 06:22:42','2025-10-13 07:38:40'),(20,'smtp_password','Anytimepooja@111288','text','smtp','SMTP password',1,'2025-10-13 06:22:42','2025-10-13 07:38:40'),(21,'smtp_from_name','Anytime Pooja','text','smtp','From name for emails',1,'2025-10-13 06:22:42','2025-10-13 07:38:40'),(22,'smtp_from_email','noreply@anytimepooja.com','text','smtp','From email address',1,'2025-10-13 06:22:42','2025-10-13 07:38:40'),(23,'smtp_reply_to','support@anytimepooja.com','text','smtp','Reply-to email address',1,'2025-10-13 06:22:42','2025-10-13 07:38:40'),(24,'site_name','Anytime Pooja','text','general','Site name',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(25,'site_url','https://anytimepooja.com','text','general','Site URL',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(26,'contact_email','support@anytimepooja.com','text','general','Contact email',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(27,'contact_phone','+91-9876543210','text','general','Contact phone',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(28,'address','123 Spiritual Street, Divine City, India - 110001','text','general','Business address',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(29,'currency','INR','text','general','Default currency',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(30,'timezone','Asia/Kolkata','text','general','Default timezone',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(31,'maintenance_mode','false','boolean','general','Maintenance mode toggle',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(32,'google_analytics_id','','text','general','Google Analytics tracking ID',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(33,'facebook_pixel_id','','text','general','Facebook Pixel ID',1,'2025-10-13 06:22:42','2025-10-13 06:22:42'),(34,'google_tag_manager_id','','text','general','Google Tag Manager ID',1,'2025-10-13 06:22:42','2025-10-13 06:22:42');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sliders`
--

DROP TABLE IF EXISTS `sliders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sliders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(500) DEFAULT NULL,
  `cta_text` varchar(100) NOT NULL,
  `cta_link` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sliders`
--

LOCK TABLES `sliders` WRITE;
/*!40000 ALTER TABLE `sliders` DISABLE KEYS */;
INSERT INTO `sliders` VALUES (1,'Mandir Collection','Beautiful idols, bells, and temple essentials for your home','Explore Mandir','/products?category=mandir','/luxury-home-decor.jpg',0,1,'2025-10-13 04:29:15','2025-10-13 05:20:27'),(2,'Premium Astrology Tools','Crystals, tarot cards, and spiritual guidance instruments','Discover Astrology','/products?category=crystals','/premium-modern-electronics-devices.jpg',1,2,'2025-10-13 04:29:15','2025-10-13 04:29:15'),(3,'Pooja Essentials Sale','Up to 40% off on incense, diyas, and ritual items','Shop Sale','/products?category=sale','/large-banner-for-anytime-pooja.jpg',1,3,'2025-10-13 04:29:15','2025-10-13 04:29:15'),(4,'Crystal Healing Collection','Authentic gemstones and healing crystals for spiritual wellness','Browse Crystals','/products?category=crystals','/luxury-beauty-products.jpg',1,4,'2025-10-13 04:29:15','2025-10-13 04:29:15'),(5,'New Matter is Online','otuh mogra singh','Explore','http://localhost:3000/admin/sliders/new','/upload/sliders/1760332898558-pngtree-abstract-orange-curve-banner-background-vector-picture-image_16559660.png',1,1,'2025-10-13 05:21:38','2025-10-13 05:21:38');
/*!40000 ALTER TABLE `sliders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('billing','shipping') NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `company` varchar(100) DEFAULT NULL,
  `address_line_1` varchar(255) NOT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'India',
  `phone` varchar(20) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_addresses`
--

LOCK TABLES `user_addresses` WRITE;
/*!40000 ALTER TABLE `user_addresses` DISABLE KEYS */;
INSERT INTO `user_addresses` VALUES (4,4,'shipping','ROHIT','PARIT','','229/43 RAILWAY COLONY MANDAWALI GALI NUMBER 11 5TH FLOOR DELHI 110092','','NEW DELHI','Delhi','110092','India','09810167696',1,'2025-10-13 09:21:10','2025-10-13 09:21:10'),(5,4,'billing','ROHIT','PARIT','','229/43 RAILWAY COLONY MANDAWALI GALI NUMBER 11 5TH FLOOR DELHI 110092','','NEW DELHI','Delhi','110092','India','+919810167696',1,'2025-10-15 06:52:14','2025-10-15 06:52:14');
/*!40000 ALTER TABLE `user_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_coupons`
--

DROP TABLE IF EXISTS `user_coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `coupon_code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT '0.00',
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_coupon_code` (`coupon_code`),
  KEY `idx_is_used` (`is_used`),
  CONSTRAINT `user_coupons_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_coupons`
--

LOCK TABLES `user_coupons` WRITE;
/*!40000 ALTER TABLE `user_coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('order','payment','promotion','system','security') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT '0',
  `action_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_type` (`type`),
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_payment_methods`
--

DROP TABLE IF EXISTS `user_payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_payment_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `payment_type` enum('card','upi','wallet','netbanking') NOT NULL,
  `card_number` varchar(20) DEFAULT NULL,
  `card_holder_name` varchar(100) DEFAULT NULL,
  `expiry_month` varchar(2) DEFAULT NULL,
  `expiry_year` varchar(4) DEFAULT NULL,
  `cvv` varchar(4) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `wallet_type` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_payment_type` (`payment_type`),
  CONSTRAINT `user_payment_methods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_payment_methods`
--

LOCK TABLES `user_payment_methods` WRITE;
/*!40000 ALTER TABLE `user_payment_methods` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `preference_key` varchar(100) NOT NULL,
  `preference_value` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_preference` (`user_id`,`preference_key`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_preferences`
--

LOCK TABLES `user_preferences` WRITE;
/*!40000 ALTER TABLE `user_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_reviews`
--

DROP TABLE IF EXISTS `user_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comment` text,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '1',
  `helpful_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_review` (`user_id`,`product_id`),
  KEY `order_id` (`order_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `user_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `user_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_reviews`
--

LOCK TABLES `user_reviews` WRITE;
/*!40000 ALTER TABLE `user_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email_notifications` tinyint(1) DEFAULT '1',
  `sms_notifications` tinyint(1) DEFAULT '0',
  `marketing_emails` tinyint(1) DEFAULT '1',
  `order_updates` tinyint(1) DEFAULT '1',
  `security_alerts` tinyint(1) DEFAULT '1',
  `two_factor_auth` tinyint(1) DEFAULT '0',
  `profile_visibility` enum('public','private') COLLATE utf8mb4_unicode_ci DEFAULT 'private',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_settings` (`user_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES (1,4,1,0,1,1,1,0,'private','2025-10-15 07:31:59','2025-10-15 07:31:59');
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `newsletter_subscribed` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email_active` (`email`,`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'newuser@example.com','$2a$12$uY1dkLRe6bt2M6.4yqJJ1.4ylk.0.YU1/joncOJ5tGmjRsl01xnJy','New','User','1234567890',NULL,NULL,NULL,0,1,1,'2025-10-13 08:28:12','2025-10-13 08:28:12'),(4,'rbusiness1999@gmail.com','$2a$12$F9cVf4QqyabzGtF7NfzTH.xJiBSI6hsNM7k/7sekwU4JMDoCOYGX2','ROHIT','PARIT','+919810167696','/upload/profiles/1760513658942-rohit-photo_converted.png',NULL,NULL,0,1,1,'2025-10-13 08:55:55','2025-10-15 07:34:19');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-15 13:29:53
