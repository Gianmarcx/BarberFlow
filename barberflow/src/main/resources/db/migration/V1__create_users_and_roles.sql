CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role VARCHAR(100) NOT NULL,
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  notes TEXT,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  barber_id BIGINT NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  CONSTRAINT fk_schedules_barber FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uk_schedules_barber_day UNIQUE (barber_id, day_of_week)
);

CREATE TABLE services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT NOT NULL,
  price DOUBLE NOT NULL,
  owner_id BIGINT NOT NULL,
  CONSTRAINT fk_services_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  barber_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  service_name VARCHAR(255),
  price DOUBLE,
  notes TEXT,
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_barber FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE subscription_status (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  subscription_type VARCHAR(100) NOT NULL,
  description TEXT
);
