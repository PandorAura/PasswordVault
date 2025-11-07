## Setup DB Connection

### 1. Make sure you have mysql installed
### 2. Create table
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS passwordvault"  
```
### 3. Create .env file and fill it in
```bash
cp .env.example .env # copy the contents of the example env file in your actual .env file
```
### 4. Run the project
```bash
./gradlew bootRun
```