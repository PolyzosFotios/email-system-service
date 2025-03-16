# Email System Service

**Email System Service** is a Django application that allows users to send, receive and manage emails.

## Features
* Manage incoming & sent emails  
* Archiving emails  
* Sending emails  
* Responsive UI

## Technologies Used
* Python, Javascript
* Django
* SQLite
* HTML, CSS

## How to run the project

**Clone the repository**:

* git clone https://github.com/PolyzosFotios/email-system-service.git
* cd email-system-service

**Create and activate the Virtual Environment**:

* python -m venv venv
* source venv/bin/activate  #Mac/Linux
* venv\Scripts\activate #Windows

**Install the dependencies:**

* pip install -r requirements.txt

**Apply migrations:**

* python manage.py migrate

**Run Django server:**

* python manage.py runserver

## How to use it

* Create at least two different accounts via Sign up.
* Sign in with the one of them.
* Inbox: view your inbox.
* Compose: send a new email.
* Sent: view sent emails
* Archive: view archive emails