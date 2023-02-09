CREATE DATABASE IF NOT EXISTS `db-cron-nodejs`;

USE `db-cron-nodejs`;

CREATE TABLE user (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(45) DEFAULT NULL UNIQUE,
  email VARCHAR(255) DEFAULT NULL,
  password VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE event (
  id INT(11) NOT NULL AUTO_INCREMENT,
  name VARCHAR(45) DEFAULT NULL UNIQUE,
  event_date DATE DEFAULT NULL,
  user_id INT(11) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE users_events (
  user_id INT(11) NOT NULL,
  event_id INT(11) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (event_id) REFERENCES event(id)
);

CREATE TABLE notification (
  id INT(11) NOT NULL AUTO_INCREMENT,
  message VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE users_notifications (
  user_id INT(11) NOT NULL,
  notification_id INT(11) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (notification_id) REFERENCES notification(id)
);
