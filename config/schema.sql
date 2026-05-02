-- ═══════════════════════════════════════════
--  Child Link Database Schema
--  MySQL 8.0+
-- ═══════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS childlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE childlink;

-- ── جدول البلاغات المفقودين ──
CREATE TABLE missing_reports (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    age         TINYINT UNSIGNED,
    gender      ENUM('male','female') DEFAULT NULL,
    area        VARCHAR(150),
    region      VARCHAR(50),
    guardian    VARCHAR(100),
    phone       VARCHAR(20),
    description TEXT,
    image_path  VARCHAR(255),
    lost_at     DATETIME,
    status      ENUM('active','found','closed') DEFAULT 'active',
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status  (status),
    INDEX idx_region  (region),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ── جدول بلاغات المعثور عليهم ──
CREATE TABLE found_reports (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100),
    age         VARCHAR(20),
    gender      ENUM('male','female','unknown') DEFAULT 'unknown',
    area        VARCHAR(150),
    region      VARCHAR(50),
    reporter    VARCHAR(100),
    phone       VARCHAR(20),
    description TEXT,
    image_path  VARCHAR(255),
    health      ENUM('good','needs_care','emergency') DEFAULT 'good',
    child_status ENUM('with_reporter','police','ambulance','at_location') DEFAULT 'with_reporter',
    found_at    DATETIME,
    status      ENUM('active','matched','closed') DEFAULT 'active',
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status  (status),
    INDEX idx_region  (region),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ── جدول الملفات ──
CREATE TABLE uploads (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('missing','found','general') DEFAULT 'general',
    report_id   INT DEFAULT NULL,
    filename    VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type   VARCHAR(100),
    size_bytes  INT UNSIGNED,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── جدول Rate Limiting ──
CREATE TABLE rate_limits (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ip_address  VARCHAR(45) NOT NULL,
    action      VARCHAR(50) NOT NULL,
    attempts    TINYINT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_action (ip_address, action)
) ENGINE=InnoDB;
