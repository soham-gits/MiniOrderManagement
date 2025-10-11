# Mini Order Management API

## Overview
This is a mini Order Management API built with Node.js, Express, TypeScript, and MongoDB. It supports multi-product orders, stock validation, and atomic transactions.

## Features
- Add products (`POST /products`)
- List products (`GET /products`)
- Create orders with stock validation (`POST /orders`)
- List orders with product details (`GET /orders`)
- Joi validation for request body
- MongoDB transactions for atomic operations

## Project Structure
src/
├─ controllers/
├─ services/
├─ routes/
├─ models/
├─ validation/
└─ index.ts

## Technologies
- Node.js, Express, TypeScript
- MongoDB + Mongoose
- Joi validation
- Postman for API testing

## Installation
```bash
git clone https://github.com/soham-gits/MiniOrderManagement.git
cd MiniOrderManagement

